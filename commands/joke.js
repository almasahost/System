const Utils = require('../utils');

module.exports = {
    data: {
        name: 'joke',
        description: 'عرض نكتة عشوائية',
        usage: 'joke',
        aliases: ['nook', 'funny'],
        cooldown: 3
    },
    
    async execute(message) {
        const jokes = [
            'لماذا لا يمكن للبرمجيين النوم؟ لأن لديهم حلقات لا نهائية!',
            'ما الفرق بين المبرمج والطبيب؟ المبرمج يقتل الـ bugs والطبيب يقتل المرضى!',
            'لماذا يفضل المبرمجون الظلام؟ لأن النور يقتل الـ bugs!',
            'ما هو المشروب المفضل للمبرمج؟ Java!',
            'لماذا لا يجب أن تثق في السلالم؟ لأنها دائماً تخطط لشيء ما!',
            'ما الذي قاله المحيط للشاطئ؟ لا شيء، لقد لوح فقط!',
            'لماذا لا تلعب البوكر في الأدغال؟ لأن هناك الكثير من الفهود!',
            'ما الذي يجعل المبرمج سعيداً؟ كود يعمل من المرة الأولى!',
            'لماذا يحب المبرمجون القهوة؟ لأنها تحول الكود إلى برامج!',
            'ما الفرق بين HTML و CSS؟ HTML هو الهيكل العظمي، CSS هو المكياج!',
            'لماذا لا يستطيع المبرمجون التحدث مع النساء؟ لأنهم لا يفهمون undefined!',
            'ما هو أسوأ شيء في برمجة JavaScript؟ أنك تحتاج إلى JavaScript لإصلاح JavaScript!',
            'لماذا يفضل المبرمجون الليل؟ لأن النهار مليء بالاجتماعات!',
            'ما الذي قاله المبرمج لعشيقته؟ أنت أجمل من Hello World!',
            'لماذا يعشق المبرمجون المصاعد؟ لأنها لا تحتاج إلى إعادة تشغيل!'
        ];

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

        const embed = Utils.createEmbed(
            '😄 نكتة اليوم',
            randomJoke,
            Utils.getRandomColor()
        )
        .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.reply({ embeds: [embed] });
    }
}; 