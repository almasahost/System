const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'kick',
        description: 'طرد عضو من السيرفر',
        usage: 'kick <@user> [reason]',
        aliases: ['k'],
        cooldown: 5,
        permissions: ['KICK_MEMBERS']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `KICK_MEMBERS` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العضو المراد طرده.\n**الاستخدام:** `!kick @user [reason]`'
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
                'لا يمكنك طرد نفسك!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك طرد عضو له نفس الرتبة أو أعلى منك.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!member.kickable) {
            const embed = Utils.createErrorEmbed(
                '❌ لا يمكن طرد العضو',
                'لا يمكن طرد هذا العضو (قد يكون له رتبة أعلى من البوت).'
            );
            return message.reply({ embeds: [embed] });
        }

        const reason = args.slice(1).join(' ') || 'لا يوجد سبب محدد';

        try {
            await database.addPunishment(
                member.id,
                message.guild.id,
                message.author.id,
                'kick',
                reason
            );

            await member.send({
                embeds: [Utils.createWarningEmbed(
                    '👢 تم طردك',
                    `**السيرفر:** ${message.guild.name}\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag}`
                )]
            }).catch(() => {});

            await member.kick(`${reason} | By: ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '👢 تم طرد العضو',
                `**العضو:** ${member.user.tag}\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createWarningEmbed(
                '👢 عضو مطرود',
                `**العضو:** ${member.user.tag} (${member.id})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in kick command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة طرد العضو.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 