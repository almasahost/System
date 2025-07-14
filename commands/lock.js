const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'lock',
        description: 'قفل القناة (منع الأعضاء من الكتابة)',
        usage: 'lock [#channel] [reason]',
        aliases: ['lockdown'],
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
                SendMessages: false
            });

            const embed = Utils.createSuccessEmbed(
                '🔒 تم قفل القناة',
                `**القناة:** ${channel.name}\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const lockEmbed = Utils.createWarningEmbed(
                '🔒 القناة مقفلة',
                `تم قفل هذه القناة بواسطة ${message.author.tag}\n**السبب:** ${reason}`
            );

            if (channel.id !== message.channel.id) {
                await channel.send({ embeds: [lockEmbed] });
            }

            const logEmbed = Utils.createWarningEmbed(
                '🔒 قفل قناة',
                `**القناة:** ${channel.name} (${channel.id})\n` +
                `**السبب:** ${reason}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in lock command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة قفل القناة.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 