const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'slowmode',
        description: 'تعيين وقت الانتظار بين الرسائل في القناة',
        usage: 'slowmode <seconds> [#channel]',
        aliases: ['slow', 'sm'],
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

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد وقت الانتظار بالثواني.\n**الاستخدام:** `!slowmode <seconds> [#channel]`\n**مثال:** `!slowmode 5` أو `!slowmode 0` لإلغاء الـ slowmode'
            );
            return message.reply({ embeds: [embed] });
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب أن يكون وقت الانتظار بين 0 و 21600 ثانية (6 ساعات).'
            );
            return message.reply({ embeds: [embed] });
        }

        let channel = message.channel;
        if (args[1] && args[1].startsWith('<#')) {
            const channelId = args[1].slice(2, -1);
            const targetChannel = message.guild.channels.cache.get(channelId);
            if (targetChannel && targetChannel.isTextBased()) {
                channel = targetChannel;
            }
        }

        try {
            await channel.setRateLimitPerUser(seconds);

            const timeText = seconds === 0 ? 'معطل' : Utils.formatTime(seconds);
            
            const embed = Utils.createSuccessEmbed(
                '⏱️ تم تعديل الـ Slowmode',
                `**القناة:** ${channel.name}\n` +
                `**وقت الانتظار:** ${timeText}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            if (seconds > 0) {
                const slowmodeEmbed = Utils.createInfoEmbed(
                    '⏱️ تم تفعيل الـ Slowmode',
                    `تم تعيين وقت انتظار ${timeText} بين الرسائل في هذه القناة.`
                );

                if (channel.id !== message.channel.id) {
                    await channel.send({ embeds: [slowmodeEmbed] });
                }
            }

            const logEmbed = Utils.createInfoEmbed(
                '⏱️ تعديل Slowmode',
                `**القناة:** ${channel.name} (${channel.id})\n` +
                `**وقت الانتظار:** ${timeText}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in slowmode command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة تعديل الـ slowmode.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 