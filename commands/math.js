const Utils = require('../utils');

module.exports = {
    data: {
        name: 'math',
        description: 'حل العمليات الحسابية',
        usage: 'math <expression>',
        aliases: ['calc', 'calculate', 'eval'],
        cooldown: 3
    },
    
    async execute(message, args) {
        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العملية الحسابية.\n**الاستخدام:** `!math <expression>`\n**مثال:** `!math 2 + 2` أو `!math sqrt(16)`'
            );
            return message.reply({ embeds: [embed] });
        }

        const expression = args.join(' ');
        
        // تحقق من الأمان - منع تنفيذ كود خطر
        const dangerousPatterns = [
            /require/gi,
            /import/gi,
            /eval/gi,
            /function/gi,
            /process/gi,
            /global/gi,
            /console/gi,
            /setTimeout/gi,
            /setInterval/gi,
            /fs/gi,
            /child_process/gi
        ];

        if (dangerousPatterns.some(pattern => pattern.test(expression))) {
            const embed = Utils.createErrorEmbed(
                '⚠️ عملية غير آمنة',
                'هذه العملية غير مسموحة لأسباب أمنية.'
            );
            return message.reply({ embeds: [embed] });
        }

        // استبدال الدوال المسموحة
        let processedExpression = expression
            .replace(/\^/g, '**')  // تحويل ^ إلى **
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/floor\(/g, 'Math.floor(')
            .replace(/ceil\(/g, 'Math.ceil(')
            .replace(/round\(/g, 'Math.round(')
            .replace(/pi/gi, 'Math.PI')
            .replace(/e/gi, 'Math.E');

        try {
            // استخدام Function constructor بدلاً من eval للأمان
            const result = Function(`"use strict"; return (${processedExpression})`)();
            
            if (typeof result !== 'number' || !isFinite(result)) {
                const embed = Utils.createErrorEmbed(
                    '❌ نتيجة غير صحيحة',
                    'النتيجة غير صحيحة أو غير محدودة.'
                );
                return message.reply({ embeds: [embed] });
            }

            const embed = Utils.createSuccessEmbed(
                '🧮 نتيجة العملية الحسابية',
                `**العملية:** \`${expression}\`\n**النتيجة:** \`${result}\``
            )
            .setFooter({ text: `طُلب من ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Math calculation error:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ في العملية',
                'العملية الحسابية غير صحيحة أو تحتوي على خطأ.\n\n**الدوال المدعومة:**\n`+, -, *, /, %, ^, sqrt(), sin(), cos(), tan(), log(), abs(), floor(), ceil(), round(), pi, e`'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 