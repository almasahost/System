const { PermissionsBitField, ChannelType } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'channel',
        description: 'إدارة القنوات (إنشاء/حذف/تعديل)',
        usage: 'channel <create|delete|rename|topic> <name/channel> [options]',
        aliases: ['ch'],
        cooldown: 5,
        permissions: ['MANAGE_CHANNELS']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `MANAGE_CHANNELS` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العملية.\n' +
                '**الاستخدام:**\n' +
                '`!channel create <name> [text|voice]` - إنشاء قناة\n' +
                '`!channel delete <#channel>` - حذف قناة\n' +
                '`!channel rename <#channel> <new_name>` - إعادة تسمية قناة\n' +
                '`!channel topic <#channel> <topic>` - تعديل موضوع القناة'
            );
            return message.reply({ embeds: [embed] });
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'create':
                await this.createChannel(message, args);
                break;
            case 'delete':
                await this.deleteChannel(message, args);
                break;
            case 'rename':
                await this.renameChannel(message, args);
                break;
            case 'topic':
                await this.setChannelTopic(message, args);
                break;
            default:
                const embed = Utils.createErrorEmbed(
                    '❌ عملية غير صحيحة',
                    'العمليات المتاحة: `create`, `delete`, `rename`, `topic`'
                );
                return message.reply({ embeds: [embed] });
        }
    },

    async createChannel(message, args) {
        if (!args[1]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد اسم القناة.\n**الاستخدام:** `!channel create <name> [text|voice]`'
            );
            return message.reply({ embeds: [embed] });
        }

        const name = args[1];
        const type = args[2] && args[2].toLowerCase() === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;

        try {
            const channel = await message.guild.channels.create({
                name: name,
                type: type,
                reason: `تم إنشاء القناة بواسطة ${message.author.tag}`
            });

            const channelType = type === ChannelType.GuildVoice ? 'صوتية' : 'نصية';

            const embed = Utils.createSuccessEmbed(
                '✅ تم إنشاء القناة',
                `**الاسم:** ${channel.name}\n**النوع:** ${channelType}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createSuccessEmbed(
                '📝 إنشاء قناة جديدة',
                `**الاسم:** ${channel.name} (${channel.id})\n` +
                `**النوع:** ${channelType}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error creating channel:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء إنشاء القناة.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async deleteChannel(message, args) {
        if (!args[1]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد القناة.\n**الاستخدام:** `!channel delete <#channel>`'
            );
            return message.reply({ embeds: [embed] });
        }

        const channel = await Utils.findChannel(message.guild, args[1]);
        if (!channel) {
            const embed = Utils.createErrorEmbed(
                '❌ قناة غير موجودة',
                'لم يتم العثور على القناة المحددة.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (channel.id === message.channel.id) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'لا يمكنك حذف القناة التي تكتب فيها!'
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            const channelName = channel.name;
            const channelType = channel.type === ChannelType.GuildVoice ? 'صوتية' : 'نصية';

            await channel.delete(`تم حذف القناة بواسطة ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم حذف القناة',
                `**الاسم:** ${channelName}\n**النوع:** ${channelType}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createErrorEmbed(
                '🗑️ حذف قناة',
                `**الاسم:** ${channelName} (${channel.id})\n` +
                `**النوع:** ${channelType}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error deleting channel:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء حذف القناة.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async renameChannel(message, args) {
        if (!args[1] || !args[2]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد القناة والاسم الجديد.\n**الاستخدام:** `!channel rename <#channel> <new_name>`'
            );
            return message.reply({ embeds: [embed] });
        }

        const channel = await Utils.findChannel(message.guild, args[1]);
        if (!channel) {
            const embed = Utils.createErrorEmbed(
                '❌ قناة غير موجودة',
                'لم يتم العثور على القناة المحددة.'
            );
            return message.reply({ embeds: [embed] });
        }

        const newName = args.slice(2).join('-').toLowerCase();
        const oldName = channel.name;

        try {
            await channel.setName(newName, `تم تغيير اسم القناة بواسطة ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم تغيير اسم القناة',
                `**الاسم القديم:** ${oldName}\n**الاسم الجديد:** ${newName}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createInfoEmbed(
                '📝 تغيير اسم قناة',
                `**القناة:** ${channel} (${channel.id})\n` +
                `**الاسم القديم:** ${oldName}\n` +
                `**الاسم الجديد:** ${newName}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error renaming channel:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء تغيير اسم القناة.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async setChannelTopic(message, args) {
        if (!args[1] || !args[2]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد القناة والموضوع.\n**الاستخدام:** `!channel topic <#channel> <topic>`'
            );
            return message.reply({ embeds: [embed] });
        }

        const channel = await Utils.findChannel(message.guild, args[1]);
        if (!channel) {
            const embed = Utils.createErrorEmbed(
                '❌ قناة غير موجودة',
                'لم يتم العثور على القناة المحددة.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (channel.type === ChannelType.GuildVoice) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'لا يمكن تعديل موضوع القنوات الصوتية.'
            );
            return message.reply({ embeds: [embed] });
        }

        const topic = args.slice(2).join(' ');

        try {
            await channel.setTopic(topic, `تم تغيير موضوع القناة بواسطة ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم تغيير موضوع القناة',
                `**القناة:** ${channel.name}\n**الموضوع الجديد:** ${topic}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createInfoEmbed(
                '📝 تغيير موضوع قناة',
                `**القناة:** ${channel} (${channel.id})\n` +
                `**الموضوع الجديد:** ${topic}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error setting channel topic:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء تغيير موضوع القناة.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 