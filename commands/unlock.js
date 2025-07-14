const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'unlock',
        description: 'إلغاء قفل القناة (السماح للأعضاء بالكتابة)',
        usage: 'unlock [#channel] [reason]',
        aliases: ['unlockdown'],
        cooldown: 5,
        permissions: ['MANAGE_CHANNELS']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `MANAGE_CHANNELS` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        let channel = message.channel;
        let reason = args.join(' ') || 'لا يوجد سبب محدد';

        if (args[0] && args[0].startsWith('<#')) {
            const channelId = args[0].slice(2, -1);
            const targetChannel = message.guild.channels.cache.get(channelId);
            if (targetChannel) {
                channel = targetChannel;
                reason = args.slice(1).join(' ') || 'لا يوجد سبب محدد';
            }
        }

        try {
            const everyoneRole = message.guild.roles.everyone;
            
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: null
            });

            const embed = Utils.createSuccessEmbed(
                '🔓 تم إلغاء قفل القناة',
                `**القناة:** ${channel.name}\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const unlockEmbed = Utils.createSuccessEmbed(
                '🔓 تم إلغاء قفل القناة',
                `تم إلغاء قفل هذه القناة بواسطة ${message.author.tag}\n**السبب:** ${reason}`
            );

            if (channel.id !== message.channel.id) {
                await channel.send({ embeds: [unlockEmbed] });
            }

            const logEmbed = Utils.createSuccessEmbed(
                '🔓 إلغاء قفل قناة',
                `**القناة:** ${channel.name} (${channel.id})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in unlock command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة إلغاء قفل القناة.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 