const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'daily',
        description: 'الحصول على المكافأة اليومية',
        usage: 'daily',
        aliases: ['reward'],
        cooldown: 3
    },
    
    async execute(message) {
        try {
            let userData = await database.getUserData(message.author.id);
            
            if (!userData) {
                await database.createUser({
                    id: message.author.id,
                    username: message.author.username,
                    discriminator: message.author.discriminator,
                    avatar: message.author.avatar
                });
                userData = await database.getUserData(message.author.id);
            }

            const now = new Date();
            const lastDaily = userData.last_daily ? new Date(userData.last_daily) : null;
            
            // التحقق من المكافأة اليومية (24 ساعة)
            if (lastDaily && (now - lastDaily) < 24 * 60 * 60 * 1000) {
                const timeLeft = 24 * 60 * 60 * 1000 - (now - lastDaily);
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                const embed = Utils.createWarningEmbed(
                    '⏰ المكافأة اليومية',
                    `لقد حصلت على مكافأتك اليومية بالفعل!\n` +
                    `⏱️ **الوقت المتبقي:** ${hoursLeft}h ${minutesLeft}m`
                );
                return message.reply({ embeds: [embed] });
            }

            // حساب المكافأة اليومية
            const baseReward = 100;
            const bonusReward = Math.floor(Math.random() * 50); // مكافأة عشوائية 0-50
            const totalReward = baseReward + bonusReward;

            // تحديث الرصيد والوقت
            await database.updateUserCoins(message.author.id, totalReward);
            
            // تحديث وقت المكافأة اليومية (سنحتاج لإضافة هذا للقاعدة)
            await this.updateLastDaily(message.author.id, now);

            const newBalance = (userData.coins || 0) + totalReward;

            const embed = Utils.createSuccessEmbed(
                '🎁 مكافأة يومية!',
                `**تهانينا!** لقد حصلت على مكافأتك اليومية!\n\n` +
                `💰 **المكافأة:** ${totalReward} عملة\n` +
                `💎 **الرصيد الجديد:** ${newBalance.toLocaleString()} عملة\n\n` +
                `🕒 **العودة غداً للحصول على المزيد!**`
            )
            .setThumbnail(message.author.displayAvatarURL());

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in daily command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة الحصول على المكافأة اليومية.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async updateLastDaily(userId, date) {
        return new Promise((resolve, reject) => {
            const db = require('../database').db;
            db.run(
                'UPDATE users SET last_daily = ? WHERE id = ?',
                [date.toISOString(), userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
}; 