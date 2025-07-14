const { EmbedBuilder } = require('discord.js');
const Utils = require('../utils');
const config = require('../config');

module.exports = {
    data: {
        name: 'serverinfo',
        description: 'عرض معلومات السيرفر',
        usage: 'serverinfo',
        aliases: ['server', 'guild', 'guildinfo'],
        cooldown: 5
    },
    
    async execute(message) {
        const guild = message.guild;
        
        const verificationLevels = {
            0: 'بدون',
            1: 'منخفض',
            2: 'متوسط',
            3: 'عالي',
            4: 'أعلى'
        };

        const explicitContentFilter = {
            0: 'معطل',
            1: 'الأعضاء بدون رتب',
            2: 'جميع الأعضاء'
        };

        const boostLevel = {
            0: 'لا يوجد',
            1: 'المستوى 1',
            2: 'المستوى 2',
            3: 'المستوى 3'
        };

        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === 0).size;
        const voiceChannels = channels.filter(c => c.type === 2).size;
        const categoryChannels = channels.filter(c => c.type === 4).size;

        const members = guild.members.cache;
        const humans = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;

        const onlineMembers = members.filter(m => m.presence?.status === 'online').size;
        const idleMembers = members.filter(m => m.presence?.status === 'idle').size;
        const dndMembers = members.filter(m => m.presence?.status === 'dnd').size;
        const offlineMembers = members.filter(m => !m.presence || m.presence.status === 'offline').size;

        const embed = new EmbedBuilder()
            .setTitle(`🏰 معلومات السيرفر: ${guild.name}`)
            .setColor(config.colors.info)
            .setThumbnail(guild.iconURL({ size: 512 }))
            .addFields(
                { name: '🆔 ID', value: guild.id, inline: true },
                { name: '👑 المالك', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 تم إنشاؤه', value: Utils.formatDate(guild.createdAt), inline: true },
                { name: '👥 الأعضاء', value: `${guild.memberCount} عضو`, inline: true },
                { name: '🤖 البوتات', value: `${bots} بوت`, inline: true },
                { name: '😄 الإيموجي', value: `${guild.emojis.cache.size} إيموجي`, inline: true },
                { name: '📊 القنوات', value: `${textChannels} نصية • ${voiceChannels} صوتية • ${categoryChannels} فئة`, inline: false },
                { name: '🎭 الرتب', value: `${guild.roles.cache.size} رتبة`, inline: true },
                { name: '🔒 مستوى التحقق', value: verificationLevels[guild.verificationLevel], inline: true },
                { name: '🔞 فلتر المحتوى', value: explicitContentFilter[guild.explicitContentFilter], inline: true },
                { name: '🚀 مستوى البوست', value: boostLevel[guild.premiumTier], inline: true },
                { name: '💎 عدد البوست', value: `${guild.premiumSubscriptionCount || 0} بوست`, inline: true },
                { name: '🌍 المنطقة', value: guild.preferredLocale || 'غير محدد', inline: true }
            )
            .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() })
            .setTimestamp();

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        const statusEmbed = new EmbedBuilder()
            .setTitle('📊 حالة الأعضاء')
            .setColor(config.colors.success)
            .addFields(
                { name: '🟢 متصل', value: `${onlineMembers}`, inline: true },
                { name: '🟡 غير متفرغ', value: `${idleMembers}`, inline: true },
                { name: '🔴 مشغول', value: `${dndMembers}`, inline: true },
                { name: '⚫ غير متصل', value: `${offlineMembers}`, inline: true },
                { name: '👤 بشر', value: `${humans}`, inline: true },
                { name: '🤖 بوتات', value: `${bots}`, inline: true }
            );

        await message.reply({ embeds: [embed, statusEmbed] });
    }
}; 