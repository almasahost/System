const axios = require('axios');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'meme',
        description: 'عرض meme عشوائي',
        usage: 'meme',
        aliases: ['memes', 'funny'],
        cooldown: 5
    },
    
    async execute(message) {
        try {
            const response = await axios.get('https://meme-api.com/gimme');
            const memeData = response.data;

            if (!memeData || !memeData.url) {
                return this.fallbackMeme(message);
            }

            const embed = Utils.createEmbed(
                '😂 Meme عشوائي',
                `**العنوان:** ${memeData.title || 'بدون عنوان'}\n` +
                `**المصدر:** r/${memeData.subreddit || 'memes'}`,
                Utils.getRandomColor()
            )
            .setImage(memeData.url)
            .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching meme:', error);
            await this.fallbackMeme(message);
        }
    },

    async fallbackMeme(message) {
        const fallbackMemes = [
            'https://i.imgur.com/dQw4w9W.gif',
            'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif',
            'https://media.giphy.com/media/l3vRgiN5Qz3z11oAM/giphy.gif'
        ];

        const randomMeme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];

        const embed = Utils.createEmbed(
            '😂 Meme عشوائي',
            'إليك meme عشوائي!',
            Utils.getRandomColor()
        )
        .setImage(randomMeme)
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 