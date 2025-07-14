const Utils = require('../utils');

module.exports = {
    data: {
        name: 'coin',
        description: 'رمي العملة',
        usage: 'coin',
        aliases: ['flip', 'coinflip'],
        cooldown: 2
    },
    
    async execute(message, args) {
        const outcomes = ['heads', 'tails'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        
        const resultText = result === 'heads' ? 'صورة 🪙' : 'كتابة 🪙';
        const resultEmoji = result === 'heads' ? '🪙' : '🪙';

        const embed = Utils.createEmbed(
            '🪙 رمي العملة',
            `${resultEmoji} **${resultText}**`,
            Utils.getRandomColor()
        )
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 