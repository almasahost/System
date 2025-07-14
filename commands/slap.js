const Utils = require('../utils');

module.exports = {
    data: {
        name: 'slap',
        description: 'صفع عضو',
        usage: 'slap <@user>',
        aliases: ['hit'],
        cooldown: 3
    },
    
    async execute(message, args) {
        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد الشخص المراد صفعه.\n**الاستخدام:** `!slap @user`'
            );
            return message.reply({ embeds: [embed] });
        }

        const targetUser = await Utils.findMember(message.guild, args[0]);
        if (!targetUser) {
            const embed = Utils.createErrorEmbed(
                '❌ عضو غير موجود',
                'لم يتم العثور على العضو المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (targetUser.id === message.author.id) {
            const embed = Utils.createEmbed(
                '🤚 صفع النفس',
                `${message.author} يصفع نفسه! هذا محرج... 😅`,
                Utils.getRandomColor()
            );
            return message.reply({ embeds: [embed] });
        }

        const slapGifs = [
            'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
            'https://media.giphy.com/media/3XlEk2RxPS1m8/giphy.gif',
            'https://media.giphy.com/media/mEtSQlxVLhPAQ/giphy.gif',
            'https://media.giphy.com/media/JLmSPBiUIGWrK/giphy.gif',
            'https://media.giphy.com/media/xUO4t2gkWBxDi/giphy.gif'
        ];

        const randomGif = slapGifs[Math.floor(Math.random() * slapGifs.length)];

        const slapMessages = [
            `${message.author} يصفع ${targetUser}! 👋`,
            `${targetUser} تلقى صفعة من ${message.author}! 💥`,
            `${message.author} أعطى ${targetUser} صفعة قوية! ✋`,
            `صفعة مؤلمة من ${message.author} إلى ${targetUser}! 🤚`
        ];

        const randomMessage = slapMessages[Math.floor(Math.random() * slapMessages.length)];

        const embed = Utils.createEmbed(
            '🤚 صفعة!',
            randomMessage,
            Utils.getRandomColor()
        )
        .setImage(randomGif)
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 