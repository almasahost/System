const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'clear',
        description: 'حذف عدد معين من الرسائل',
        usage: 'clear <amount> [@user]',
        aliases: ['purge', 'delete'],
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
                'يجب تحديد عدد الرسائل المراد حذفها.\n**الاستخدام:** `!clear <amount> [@user]`\n**مثال:** `!clear 10` أو `!clear 5 @user`'
            );
            return message.reply({ embeds: [embed] });
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب أن يكون عدد الرسائل بين 1 و 100.'
            );
            return message.reply({ embeds: [embed] });
        }

        let targetUser = null;
        if (args[1]) {
            targetUser = await Utils.findMember(message.guild, args[1]);
            if (!targetUser) {
                const embed = Utils.createErrorEmbed(
                    '❌ عضو غير موجود',
                    'لم يتم العثور على العضو المحدد.'
                );
                return message.reply({ embeds: [embed] });
            }
        }

        try {
            await message.delete();

            const fetchedMessages = await message.channel.messages.fetch({ limit: amount + 50 });
            let messagesToDelete = fetchedMessages;

            if (targetUser) {
                messagesToDelete = fetchedMessages.filter(msg => msg.author.id === targetUser.id);
            }

            const filteredMessages = messagesToDelete.filter(msg => 
                Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
            );

            if (filteredMessages.size === 0) {
                const embed = Utils.createErrorEmbed(
                    '❌ لا توجد رسائل',
                    'لا توجد رسائل يمكن حذفها (الرسائل أقدم من 14 يوم لا يمكن حذفها).'
                );
                return message.channel.send({ embeds: [embed] });
            }

            const actualAmount = Math.min(amount, filteredMessages.size);
            const toDelete = Array.from(filteredMessages.values()).slice(0, actualAmount);

            if (toDelete.length === 1) {
                await toDelete[0].delete();
            } else {
                await message.channel.bulkDelete(toDelete, true);
            }

            const embed = Utils.createSuccessEmbed(
                '🗑️ تم حذف الرسائل',
                `**عدد الرسائل المحذوفة:** ${toDelete.length}\n` +
                `**المشرف:** ${message.author.tag}` +
                (targetUser ? `\n**المستخدم المحدد:** ${targetUser.user.tag}` : '')
            );

            const confirmMsg = await message.channel.send({ embeds: [embed] });

            setTimeout(() => {
                confirmMsg.delete().catch(() => {});
            }, 5000);

            const logEmbed = Utils.createInfoEmbed(
                '🗑️ حذف رسائل',
                `**القناة:** ${message.channel.name} (${message.channel.id})\n` +
                `**عدد الرسائل:** ${toDelete.length}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                (targetUser ? `**المستخدم المحدد:** ${targetUser.user.tag} (${targetUser.id})\n` : '') +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in clear command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة حذف الرسائل.'
            );
            await message.channel.send({ embeds: [embed] });
        }
    }
}; 