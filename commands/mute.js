const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'mute',
        description: 'كتم عضو في السيرفر',
        usage: 'mute <@user> [time] [reason]',
        aliases: ['m'],
        cooldown: 5,
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
                'يجب تحديد العضو المراد كتمه.\n**الاستخدام:** `!mute @user [time] [reason]`\n**مثال:** `!mute @user 1h spam`'
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
                'لا يمكنك كتم نفسك!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك كتم عضو له نفس الرتبة أو أعلى منك.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!member.manageable) {
            const embed = Utils.createErrorEmbed(
                '❌ لا يمكن كتم العضو',
                'لا يمكن كتم هذا العضو (قد يكون له رتبة أعلى من البوت).'
            );
            return message.reply({ embeds: [embed] });
        }

        let timeString = args[1];
        let time = null;
        let reason = args.slice(2).join(' ') || 'لا يوجد سبب محدد';

        if (timeString && /^\d+[smhd]$/.test(timeString)) {
            time = Utils.parseTime(timeString);
        } else if (timeString) {
            reason = args.slice(1).join(' ');
        }

        try {
            if (time) {
                await member.timeout(time * 1000, `${reason} | By: ${message.author.tag}`);
                
                await database.addPunishment(
                    member.id,
                    message.guild.id,
                    message.author.id,
                    'mute',
                    reason,
                    time
                );

                await member.send({
                    embeds: [Utils.createWarningEmbed(
                        '🔇 تم كتمك',
                        `**السيرفر:** ${message.guild.name}\n` +
                        `**المدة:** ${Utils.formatTime(time)}\n` +
                        `**السبب:** ${reason}\n` +
                        `**المشرف:** ${message.author.tag}`
                    )]
                }).catch(() => {});

                const embed = Utils.createSuccessEmbed(
                    '🔇 تم كتم العضو',
                    `**العضو:** ${member.user.tag}\n` +
                    `**المدة:** ${Utils.formatTime(time)}\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag}`
                );

                await message.reply({ embeds: [embed] });

                const logEmbed = Utils.createWarningEmbed(
                    '🔇 عضو مكتوم',
                    `**العضو:** ${member.user.tag} (${member.id})\n` +
                    `**المدة:** ${Utils.formatTime(time)}\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                    `**التاريخ:** ${Utils.formatDate(new Date())}`
                );

                await Utils.sendLog(message.client, logEmbed);

            } else {
                await member.timeout(28 * 24 * 60 * 60 * 1000, `${reason} | By: ${message.author.tag}`);
                
                await database.addPunishment(
                    member.id,
                    message.guild.id,
                    message.author.id,
                    'mute',
                    reason
                );

                await member.send({
                    embeds: [Utils.createWarningEmbed(
                        '🔇 تم كتمك',
                        `**السيرفر:** ${message.guild.name}\n` +
                        `**المدة:** دائم\n` +
                        `**السبب:** ${reason}\n` +
                        `**المشرف:** ${message.author.tag}`
                    )]
                }).catch(() => {});

                const embed = Utils.createSuccessEmbed(
                    '🔇 تم كتم العضو',
                    `**العضو:** ${member.user.tag}\n` +
                    `**المدة:** دائم\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag}`
                );

                await message.reply({ embeds: [embed] });

                const logEmbed = Utils.createWarningEmbed(
                    '🔇 عضو مكتوم',
                    `**العضو:** ${member.user.tag} (${member.id})\n` +
                    `**المدة:** دائم\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                    `**التاريخ:** ${Utils.formatDate(new Date())}`
                );

                await Utils.sendLog(message.client, logEmbed);
            }

        } catch (error) {
            console.error('Error in mute command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة كتم العضو.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 