const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'leaderboard',
        description: 'عرض قائمة المتصدرين',
        usage: 'leaderboard [coins|xp]',
        aliases: ['lb', 'top', 'rich'],
        cooldown: 5
    },
    
    async execute(message, args, client) {
        const type = args[0] && ['coins', 'xp'].includes(args[0].toLowerCase()) ? args[0].toLowerCase() : 'coins';
        
        try {
            const leaderboard = await database.getLeaderboard(type, 10);
            
            if (leaderboard.length === 0) {
                const embed = Utils.createInfoEmbed(
                    '📊 قائمة المتصدرين',
                    'لا توجد بيانات متاحة حالياً.'
                );
                return message.reply({ embeds: [embed] });
            }

            const title = type === 'xp' ? '⭐ متصدرو الخبرة' : '💰 متصدرو العملات';
            const field = type === 'xp' ? 'xp' : 'coins';
            const unit = type === 'xp' ? 'XP' : 'عملة';

            const embed = Utils.createSuccessEmbed(title, '');

            let description = '';
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                const position = i + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `**${position}.**`;
                
                let username = user.username;
                try {
                    const discordUser = client.users.cache.get(user.id) || await client.users.fetch(user.id);
                    username = discordUser.username;
                } catch (error) {
                }

                const value = user[field] || 0;
                description += `${medal} **${username}** - ${value.toLocaleString()} ${unit}\n`;
            }

            embed.setDescription(description);
            embed.setFooter({ text: `${message.guild.name} | الصفحة 1/1`, iconURL: message.guild.iconURL() });

            const currentUserData = await database.getUserData(message.author.id);
            if (currentUserData) {
                const currentUserValue = currentUserData[field] || 0;
                const currentUserRank = await this.getUserRank(message.author.id, type);
                
                embed.addFields({
                    name: '📍 ترتيبك',
                    value: `**المرتبة:** #${currentUserRank}\n**${unit}:** ${currentUserValue.toLocaleString()}`,
                    inline: true
                });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in leaderboard command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء استرجاع قائمة المتصدرين.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async getUserRank(userId, type = 'coins') {
        return new Promise((resolve, reject) => {
            const db = require('../database').db;
            const orderBy = type === 'xp' ? 'xp' : 'coins';
            
            db.get(
                `SELECT COUNT(*) + 1 as rank FROM users WHERE ${orderBy} > (SELECT ${orderBy} FROM users WHERE id = ?)`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.rank : 0);
                }
            );
        });
    }
}; 