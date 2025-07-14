const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'say',
        description: 'جعل البوت يكتب رسالة',
        usage: 'say <message>',
        aliases: ['echo', 'repeat'],
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
                'يجب تحديد الرسالة.\n**الاستخدام:** `!say <message>`'
            );
            return message.reply({ embeds: [embed] });
        }

        const messageContent = args.join(' ');
        
        if (messageContent.length > 2000) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'الرسالة طويلة جداً! يجب أن تكون أقل من 2000 حرف.'
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            await message.delete();
            await message.channel.send(messageContent);

            const logEmbed = Utils.createInfoEmbed(
                '📢 رسالة Say',
                `**المحتوى:** ${Utils.truncateString(messageContent, 100)}\n` +
                `**القناة:** ${message.channel.name} (${message.channel.id})\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in say command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء إرسال الرسالة.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 