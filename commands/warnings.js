const Utils = require('../utils');
const database = require('../database');

module.exports = {
    data: {
        name: 'warnings',
        description: 'عرض تحذيرات مستخدم',
        usage: 'warnings [@user]',
        aliases: ['warns', 'infractions'],
        cooldown: 3
    },
    
    async execute(message, args) {
        let targetUser;
        
        if (args[0]) {
            targetUser = await Utils.findMember(message.guild, args[0]);
            if (!targetUser) {
                const embed = Utils.createErrorEmbed(
                    '❌ عضو غير موجود',
                    'لم يتم العثور على العضو المحدد.'
                );
                return message.reply({ embeds: [embed] });
            }
        } else {
            targetUser = message.member;
        }

        try {
            const warnings = await database.getUserWarnings(targetUser.id, message.guild.id);

            if (warnings.length === 0) {
                const embed = Utils.createSuccessEmbed(
                    '✅ لا توجد تحذيرات',
                    `${targetUser.user.tag} ليس لديه أي تحذيرات في هذا السيرفر.`
                );
                return message.reply({ embeds: [embed] });
            }

            const embed = Utils.createWarningEmbed(
                `⚠️ تحذيرات ${targetUser.user.tag}`,
                `إجمالي التحذيرات: **${warnings.length}**`
            )
            .setThumbnail(targetUser.user.displayAvatarURL());

            const warningList = warnings.slice(0, 10).map((warning, index) => {
                const date = new Date(warning.created_at);
                return `**${index + 1}.** ${warning.reason}\n` +
                       `📅 ${Utils.formatDate(date)}\n` +
                       `👮 المشرف: <@${warning.moderator_id}>`;
            }).join('\n\n');

            embed.addFields({
                name: '📋 آخر التحذيرات',
                value: warningList || 'لا توجد تحذيرات',
                inline: false
            });

            if (warnings.length > 10) {
                embed.setFooter({ text: `عرض آخر 10 تحذيرات من أصل ${warnings.length}` });
            }

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in warnings command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة استرجاع التحذيرات.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 