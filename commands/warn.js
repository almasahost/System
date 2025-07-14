const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'warn',
        description: 'إعطاء تحذير لعضو',
        usage: 'warn <@user> <reason>',
        aliases: ['w'],
        cooldown: 3,
        permissions: ['MANAGE_MESSAGES']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `MANAGE_MESSAGES` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العضو المراد تحذيره.\n**الاستخدام:** `!warn @user <reason>`'
            );
            return message.reply({ embeds: [embed] });
        }

        const member = await Utils.findMember(message.guild, args[0]);
        if (!member) {
            const embed = Utils.createErrorEmbed(
                '❌ عضو غير موجود',
                'لم يتم العثور على العضو المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (member.id === message.author.id) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'لا يمكنك تحذير نفسك!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك تحذير عضو له نفس الرتبة أو أعلى منك.'
            );
            return message.reply({ embeds: [embed] });
        }

        const reason = args.slice(1).join(' ');
        if (!reason) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد سبب التحذير.\n**الاستخدام:** `!warn @user <reason>`'
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            await database.addWarning(
                member.id,
                message.guild.id,
                message.author.id,
                reason
            );

            const warnings = await database.getUserWarnings(member.id, message.guild.id);
            const warningCount = warnings.length;

            await member.send({
                embeds: [Utils.createWarningEmbed(
                    '⚠️ تحذير',
                    `**السيرفر:** ${message.guild.name}\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag}\n` +
                    `**عدد التحذيرات:** ${warningCount}`
                )]
            }).catch(() => {});

            const embed = Utils.createSuccessEmbed(
                '⚠️ تم إعطاء تحذير',
                `**العضو:** ${member.user.tag}\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag}\n` +
                `**عدد التحذيرات:** ${warningCount}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createWarningEmbed(
                '⚠️ تحذير جديد',
                `**العضو:** ${member.user.tag} (${member.id})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**عدد التحذيرات:** ${warningCount}\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

            if (warningCount >= 5) {
                try {
                    await member.timeout(24 * 60 * 60 * 1000, `إجراء تلقائي: 5 تحذيرات`);
                    
                    const autoEmbed = Utils.createErrorEmbed(
                        '🔴 إجراء تلقائي',
                        `تم كتم ${member.user.tag} لمدة 24 ساعة بسبب تجاوز 5 تحذيرات.`
                    );
                    
                    await message.channel.send({ embeds: [autoEmbed] });
                } catch (error) {
                    console.error('Error in auto-mute:', error);
                }
            } else if (warningCount >= 3) {
                const warningEmbed = Utils.createWarningEmbed(
                    '🔶 تحذير مهم',
                    `${member.user.tag} أصبح لديه ${warningCount} تحذيرات. عند الوصول إلى 5 تحذيرات سيتم كتمه تلقائياً.`
                );
                
                await message.channel.send({ embeds: [warningEmbed] });
            }

        } catch (error) {
            console.error('Error in warn command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة إعطاء التحذير.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 