const Utils = require('../utils');

module.exports = {
    data: {
        name: '8ball',
        description: 'اسأل الكرة السحرية سؤالاً',
        usage: '8ball <question>',
        aliases: ['8b', 'ball'],
        cooldown: 3
    },
    
    async execute(message, args) {
        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب أن تسأل سؤالاً!\n**الاستخدام:** `!8ball <question>`'
            );
            return message.reply({ embeds: [embed] });
        }

        const question = args.join(' ');
        
        const responses = [
            '🔮 نعم بالتأكيد',
            '🔮 من المؤكد',
            '🔮 بدون شك',
            '🔮 نعم، بالتأكيد',
            '🔮 يمكنك الاعتماد على ذلك',
            '🔮 كما أراه، نعم',
            '🔮 على الأرجح',
            '🔮 المؤشرات جيدة',
            '🔮 نعم',
            '🔮 الإشارات تشير إلى نعم',
            '🔮 لا أستطيع التنبؤ الآن',
            '🔮 اسأل مرة أخرى لاحقاً',
            '🔮 أفضل عدم الإجابة الآن',
            '🔮 لا أستطيع التنبؤ الآن',
            '🔮 ركز واسأل مرة أخرى',
            '🔮 لا تعتمد على ذلك',
            '🔮 إجابتي لا',
            '🔮 مصادري تقول لا',
            '🔮 المؤشرات ليست جيدة',
            '🔮 مشكوك فيه جداً'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const embed = Utils.createEmbed(
            '🎱 الكرة السحرية',
            `**السؤال:** ${question}\n**الإجابة:** ${randomResponse}`,
            Utils.getRandomColor()
        )
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 