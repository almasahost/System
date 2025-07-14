const { EmbedBuilder } = require('discord.js');
const Utils = require('../utils');
const config = require('../config');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'عرض معلومات المستخدم',
        usage: 'userinfo [@user]',
        aliases: ['user', 'profile'],
        cooldown: 3
    },
    
    async execute(message, args) {
        let targetUser;
        
        if (args[0]) {
            targetUser = await Utils.findMember(message.guild, args[0]);
            if (!targetUser) {
                const embed = Utils.createErrorEmbed(
                    '❌ عضو غير موجود',
                    'لم يتم العثور على العضو المحدد.'
                );
                return message.reply({ embeds: [embed] });
            }
        } else {
            targetUser = message.member;
        }

        const user = targetUser.user;
        const member = targetUser;

        const badges = [];
        if (user.flags) {
            const flags = user.flags.toArray();
            if (flags.includes('Staff')) badges.push('🏅 Discord Staff');
            if (flags.includes('Partner')) badges.push('🤝 Discord Partner');
            if (flags.includes('CertifiedModerator')) badges.push('🛡️ Certified Moderator');
            if (flags.includes('Hypesquad')) badges.push('🎉 HypeSquad Events');
            if (flags.includes('HypeSquadOnlineHouse1')) badges.push('🏠 HypeSquad Bravery');
            if (flags.includes('HypeSquadOnlineHouse2')) badges.push('🏠 HypeSquad Brilliance');
            if (flags.includes('HypeSquadOnlineHouse3')) badges.push('🏠 HypeSquad Balance');
            if (flags.includes('PremiumEarlySupporter')) badges.push('💎 Early Supporter');
            if (flags.includes('BugHunterLevel1')) badges.push('🐛 Bug Hunter Level 1');
            if (flags.includes('BugHunterLevel2')) badges.push('🐛 Bug Hunter Level 2');
            if (flags.includes('VerifiedDeveloper')) badges.push('⚡ Verified Bot Developer');
        }

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setTitle(`👤 معلومات المستخدم: ${user.tag}`)
            .setColor(member.displayHexColor || config.colors.info)
            .setThumbnail(user.displayAvatarURL({ size: 512 }))
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '📅 تم إنشاء الحساب', value: Utils.formatDate(user.createdAt), inline: true },
                { name: '📥 انضم للسيرفر', value: Utils.formatDate(member.joinedAt), inline: true },
                { name: '🎭 الاسم المستعار', value: member.nickname || 'لا يوجد', inline: true },
                { name: '🏆 أعلى رتبة', value: member.roles.highest.toString(), inline: true },
                { name: '🎨 لون الرتبة', value: member.displayHexColor || '#000000', inline: true },
                { name: '📱 الحالة', value: member.presence?.status || 'offline', inline: true },
                { name: '🤖 بوت؟', value: user.bot ? 'نعم' : 'لا', inline: true },
                { name: '🔊 القناة الصوتية', value: member.voice.channel ? member.voice.channel.name : 'غير متصل', inline: true }
            )
            .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        if (badges.length > 0) {
            embed.addFields({ name: '🏅 الشارات', value: badges.join('\n'), inline: false });
        }

        if (roles.length > 0) {
            embed.addFields({ name: `🎭 الرتب (${member.roles.cache.size - 1})`, value: roles.join(' '), inline: false });
        }

        if (member.premiumSince) {
            embed.addFields({ name: '💎 بداية الـ Boost', value: Utils.formatDate(member.premiumSince), inline: true });
        }

        await message.reply({ embeds: [embed] });
    }
}; 