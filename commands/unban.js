const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'unban',
        description: 'إلغاء حظر مستخدم من السيرفر',
        usage: 'unban <user_id> [reason]',
        aliases: ['ub'],
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
                'يجب تحديد ID المستخدم المراد إلغاء حظره.\n**الاستخدام:** `!unban <user_id> [reason]`'
            );
            return message.reply({ embeds: [embed] });
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || 'لا يوجد سبب محدد';

        try {
            const bannedUsers = await message.guild.bans.fetch();
            const bannedUser = bannedUsers.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                const embed = Utils.createErrorEmbed(
                    '❌ المستخدم غير محظور',
                    'هذا المستخدم ليس محظوراً من السيرفر.'
                );
                return message.reply({ embeds: [embed] });
            }

            await message.guild.members.unban(userId, `${reason} | By: ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم إلغاء الحظر',
                `**المستخدم:** ${bannedUser.user.tag} (${userId})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createSuccessEmbed(
                '✅ إلغاء حظر',
                `**المستخدم:** ${bannedUser.user.tag} (${userId})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in unban command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة إلغاء حظر المستخدم.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 