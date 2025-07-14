const Utils = require('../utils');

module.exports = {
    data: {
        name: 'dice',
        description: 'رمي النرد',
        usage: 'dice [sides]',
        aliases: ['roll', 'd'],
        cooldown: 2
    },
    
    async execute(message, args) {
        let sides = 6;
        
        if (args[0]) {
            const parsedSides = parseInt(args[0]);
            if (isNaN(parsedSides) || parsedSides < 2 || parsedSides > 100) {
                const embed = Utils.createErrorEmbed(
                    '❌ خطأ',
                    'يجب أن يكون عدد الأوجه بين 2 و 100.'
                );
                return message.reply({ embeds: [embed] });
            }
            sides = parsedSides;
        }

        const result = Math.floor(Math.random() * sides) + 1;
        
        const diceEmojis = {
            1: '⚀',
            2: '⚁',
            3: '⚂',
            4: '⚃',
            5: '⚄',
            6: '⚅'
        };

        const diceEmoji = diceEmojis[result] || '🎲';

        const embed = Utils.createEmbed(
            '🎲 رمي النرد',
            `${diceEmoji} **${result}** (من ${sides})`,
            Utils.getRandomColor()
        )
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 