const { EmbedBuilder } = require('discord.js');
const Utils = require('../utils');
const config = require('../config');

module.exports = {
    data: {
        name: 'avatar',
        description: 'عرض صورة المستخدم',
        usage: 'avatar [@user]',
        aliases: ['av', 'pfp'],
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
        const avatarURL = user.displayAvatarURL({ size: 2048, extension: 'png' });

        const embed = new EmbedBuilder()
            .setTitle(`🖼️ صورة المستخدم: ${user.tag}`)
            .setColor(targetUser.displayHexColor || config.colors.info)
            .setImage(avatarURL)
            .setDescription(`[🔗 رابط الصورة](${avatarURL})`)
            .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
}; 