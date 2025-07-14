const Utils = require('../utils');

module.exports = {
    data: {
        name: 'ping',
        description: 'فحص سرعة استجابة البوت',
        usage: 'ping',
        aliases: ['latency', 'ms'],
        cooldown: 3
    },
    
    async execute(message, args, client) {
        const start = Date.now();
        
        const embed = Utils.createInfoEmbed(
            '🏓 Ping',
            '📡 جاري فحص سرعة الاستجابة...'
        );

        const sentMessage = await message.reply({ embeds: [embed] });
        
        const end = Date.now();
        const messageLatency = end - start;
        const apiLatency = client.ws.ping;

        let pingStatus = '🟢 ممتاز';
        if (apiLatency > 100) pingStatus = '🟡 جيد';
        if (apiLatency > 200) pingStatus = '🟠 متوسط';
        if (apiLatency > 500) pingStatus = '🔴 بطيء';

        const updatedEmbed = Utils.createSuccessEmbed(
            '🏓 Ping',
            `📡 **سرعة الرسالة:** ${messageLatency}ms\n` +
            `💓 **سرعة الـ API:** ${apiLatency}ms\n` +
            `📊 **الحالة:** ${pingStatus}`
        );

        await sentMessage.edit({ embeds: [updatedEmbed] });
    }
}; 