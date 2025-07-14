const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'unmute',
        description: 'إلغاء كتم عضو',
        usage: 'unmute <@user>',
        aliases: ['um'],
        cooldown: 3,
        permissions: ['MANAGE_MESSAGES']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `MANAGE_MESSAGES` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العضو المراد إلغاء كتمه.\n**الاستخدام:** `!unmute @user`'
            );
            return message.reply({ embeds: [embed] });
        }

        const member = await Utils.findMember(message.guild, args[0]);
        if (!member) {
            const embed = Utils.createErrorEmbed(
                '❌ عضو غير موجود',
                'لم يتم العثور على العضو المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!member.isCommunicationDisabled()) {
            const embed = Utils.createErrorEmbed(
                '❌ العضو غير مكتوم',
                'هذا العضو ليس مكتوماً.'
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            await member.timeout(null, `تم إلغاء الكتم بواسطة ${message.author.tag}`);

            await member.send({
                embeds: [Utils.createSuccessEmbed(
                    '🔊 تم إلغاء كتمك',
                    `**السيرفر:** ${message.guild.name}\n` +
                    `**المشرف:** ${message.author.tag}`
                )]
            }).catch(() => {});

            const embed = Utils.createSuccessEmbed(
                '🔊 تم إلغاء الكتم',
                `**العضو:** ${member.user.tag}\n` +
                `**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createSuccessEmbed(
                '🔊 إلغاء كتم',
                `**العضو:** ${member.user.tag} (${member.id})\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error in unmute command:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء محاولة إلغاء كتم العضو.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 