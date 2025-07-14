const Utils = require('../utils');

module.exports = {
    data: {
        name: 'hug',
        description: 'احتضان عضو',
        usage: 'hug <@user>',
        aliases: ['embrace'],
        cooldown: 3
    },
    
    async execute(message, args) {
        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد الشخص المراد احتضانه.\n**الاستخدام:** `!hug @user`'
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
                '🤗 احتضان النفس',
                `${message.author} يحتضن نفسه! 💝`,
                Utils.getRandomColor()
            );
            return message.reply({ embeds: [embed] });
        }

        const hugGifs = [
            'https://media.giphy.com/media/3bqtLDeiDtwhq/giphy.gif',
            'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
            'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
            'https://media.giphy.com/media/PHZ7v9tfQu0o0/giphy.gif',
            'https://media.giphy.com/media/42YlR8u9gV5Cw/giphy.gif'
        ];

        const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];

        const embed = Utils.createEmbed(
            '🤗 احتضان',
            `${message.author} يحتضن ${targetUser}! 💕`,
            Utils.getRandomColor()
        )
        .setImage(randomGif)
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 