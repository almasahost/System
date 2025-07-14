const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'ban',
        description: 'حظر عضو من السيرفر',
        usage: 'ban <@user> [reason]',
        aliases: ['b'],
        cooldown: 5,
        permissions: ['BAN_MEMBERS']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `BAN_MEMBERS` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العضو المراد حظره.\n**الاستخدام:** `!ban @user [reason]`'
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
                'لا يمكنك حظر نفسك!'
            );
            return message.reply({ embeds: [embed] });
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك حظر عضو له نفس الرتبة أو أعلى منك.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!member.bannable) {
            const embed = Utils.createErrorEmbed(
                '❌ لا يمكن حظر العضو',
                'لا يمكن حظر هذا العضو (قد يكون له رتبة أعلى من البوت).'
            );
            return message.reply({ embeds: [embed] });
        }

        const reason = args.slice(1).join(' ') || 'لا يوجد سبب محدد';

        try {
            await database.addPunishment(
                member.id,
                message.guild.id,
                message.author.id,
                'ban',
                reason
            );

            await member.send({
                embeds: [Utils.createErrorEmbed(
                    '⛔ تم حظرك',
                    `**السيرفر:** ${message.guild.name}\n` +
                    `**السبب:** ${reason}\n` +
                    `**المشرف:** ${message.author.tag}`
                )]
            }).catch(() => {});

            await member.ban({ reason: `${reason} | By: ${message.author.tag}` });

            const embed = Utils.createSuccessEmbed(
                '⛔ تم حظر العضو',
                `**العضو:** ${member.user.tag}\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createErrorEmbed(
                '⛔ عضو محظور',
                `**العضو:** ${member.user.tag} (${member.id})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in ban command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة حظر العضو.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 