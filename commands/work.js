const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'work',
        description: 'العمل للحصول على عملات',
        usage: 'work',
        aliases: ['job'],
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
            const lastWork = userData.last_work ? new Date(userData.last_work) : null;
            
            // التحقق من وقت العمل (ساعة واحدة)
            if (lastWork && (now - lastWork) < 60 * 60 * 1000) {
                const timeLeft = 60 * 60 * 1000 - (now - lastWork);
                const minutesLeft = Math.floor(timeLeft / (60 * 1000));
                
                const embed = Utils.createWarningEmbed(
                    '⏰ العمل',
                    `أنت متعب جداً للعمل الآن!\n` +
                    `⏱️ **الوقت المتبقي:** ${minutesLeft} دقيقة`
                );
                return message.reply({ embeds: [embed] });
            }

            // أنواع العمل والمكافآت
            const jobs = [
                { name: '💻 برمجة', reward: [50, 150], description: 'كتبت بعض الكود المفيد!' },
                { name: '🍕 توصيل طعام', reward: [30, 80], description: 'وصلت الطعام للعملاء!' },
                { name: '🏪 العمل في المتجر', reward: [40, 100], description: 'ساعدت العملاء في المتجر!' },
                { name: '🚗 سائق تاكسي', reward: [60, 120], description: 'وصلت الركاب إلى وجهتهم!' },
                { name: '🎨 تصميم', reward: [70, 130], description: 'أنشأت تصميماً رائعاً!' },
                { name: '📝 كتابة', reward: [45, 95], description: 'كتبت مقالاً مميزاً!' },
                { name: '🔧 إصلاح', reward: [55, 115], description: 'أصلحت شيئاً مكسوراً!' },
                { name: '🎵 موسيقى', reward: [35, 85], description: 'عزفت أغنية جميلة!' }
            ];

            const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
            const reward = Math.floor(Math.random() * (randomJob.reward[1] - randomJob.reward[0] + 1)) + randomJob.reward[0];

            // تحديث الرصيد والوقت
            await database.updateUserCoins(message.author.id, reward);
            await this.updateLastWork(message.author.id, now);

            const newBalance = (userData.coins || 0) + reward;

            const embed = Utils.createSuccessEmbed(
                `${randomJob.name} - عمل ممتاز!`,
                `${randomJob.description}\n\n` +
                `💰 **المكافأة:** ${reward} عملة\n` +
                `💎 **الرصيد الجديد:** ${newBalance.toLocaleString()} عملة\n\n` +
                `⏰ **يمكنك العمل مرة أخرى خلال ساعة!**`
            )
            .setThumbnail(message.author.displayAvatarURL());

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in work command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة العمل.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async updateLastWork(userId, date) {
        return new Promise((resolve, reject) => {
            const db = require('../database').db;
            db.run(
                'UPDATE users SET last_work = ? WHERE id = ?',
                [date.toISOString(), userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
}; 