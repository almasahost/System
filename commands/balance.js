const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'balance',
        description: 'عرض رصيد المستخدم',
        usage: 'balance [@user]',
        aliases: ['bal', 'money', 'coins'],
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

        try {
            let userData = await database.getUserData(targetUser.id);
            
            if (!userData) {
                await database.createUser({
                    id: targetUser.id,
                    username: targetUser.user.username,
                    discriminator: targetUser.user.discriminator,
                    avatar: targetUser.user.avatar
                });
                userData = await database.getUserData(targetUser.id);
            }

            const coins = userData?.coins || 0;
            const level = userData?.level || 1;
            const xp = userData?.xp || 0;

            const embed = Utils.createSuccessEmbed(
                '💰 الرصيد',
                ''
            )
            .setThumbnail(targetUser.user.displayAvatarURL())
            .addFields(
                { name: '💎 العملات', value: `${coins.toLocaleString()} عملة`, inline: true },
                { name: '📊 المستوى', value: `${level}`, inline: true },
                { name: '⭐ الخبرة', value: `${xp.toLocaleString()} XP`, inline: true }
            )
            .setFooter({ text: targetUser.user.tag, iconURL: targetUser.user.displayAvatarURL() });

            if (targetUser.id === message.author.id) {
                embed.setTitle('💰 رصيدك');
            } else {
                embed.setTitle(`💰 رصيد ${targetUser.user.username}`);
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in balance command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء استرجاع بيانات الرصيد.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 