const { EmbedBuilder } = require('discord.js');
const Utils = require('../utils');
const config = require('../config');

module.exports = {
    data: {
        name: 'info',
        description: 'عرض معلومات البوت',
        usage: 'info',
        aliases: ['botinfo', 'about'],
        cooldown: 5
    },
    
    async execute(message, args, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 معلومات البوت')
            .setColor(config.colors.info)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '👤 اسم البوت', value: client.user.tag, inline: true },
                { name: '🆔 ID', value: client.user.id, inline: true },
                { name: '📅 تم إنشاؤه', value: Utils.formatDate(client.user.createdAt), inline: true },
                { name: '🌐 السيرفرات', value: `${client.guilds.cache.size} سيرفر`, inline: true },
                { name: '👥 المستخدمين', value: `${client.users.cache.size} مستخدم`, inline: true },
                { name: '📊 القنوات', value: `${client.channels.cache.size} قناة`, inline: true },
                { name: '⏰ وقت التشغيل', value: uptimeString, inline: true },
                { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '💾 استخدام الذاكرة', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: '⚙️ الإصدار', value: 'v1.0.0', inline: true },
                { name: '🔧 Node.js', value: process.version, inline: true },
                { name: '📚 Discord.js', value: require('discord.js').version, inline: true }
            )
            .setFooter({ text: `${client.user.username} | ${message.guild.name}`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
}; 