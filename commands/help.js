const { EmbedBuilder } = require('discord.js');
const Utils = require('../utils');
const config = require('../config');

module.exports = {
    data: {
        name: 'help',
        description: 'عرض قائمة الأوامر المتاحة',
        usage: 'help [command]',
        aliases: ['h', 'commands'],
        cooldown: 3
    },
    
    async execute(message, args, client) {
        if (args[0]) {
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || 
                          client.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName));
            
            if (!command) {
                const embed = Utils.createErrorEmbed(
                    '❌ أمر غير موجود',
                    'لا يوجد أمر بهذا الاسم.'
                );
                return message.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📋 تفاصيل الأمر: ${command.data.name}`)
                .setColor(config.colors.info)
                .addFields(
                    { name: '📝 الوصف', value: command.data.description || 'لا يوجد وصف', inline: false },
                    { name: '🔧 الاستخدام', value: `${config.prefix}${command.data.usage || command.data.name}`, inline: false },
                    { name: '⏰ Cooldown', value: `${command.data.cooldown || 3} ثانية`, inline: true }
                )
                .setTimestamp();

            if (command.data.aliases) {
                embed.addFields({ name: '🔗 الأسماء البديلة', value: command.data.aliases.join(', '), inline: true });
            }

            if (command.data.permissions) {
                embed.addFields({ name: '🔒 الصلاحيات المطلوبة', value: command.data.permissions.join(', '), inline: false });
            }

            return message.reply({ embeds: [embed] });
        }

        const adminCommands = [];
        const generalCommands = [];
        const controlCommands = [];
        const funCommands = [];

        client.commands.forEach(command => {
            if (command.data.permissions && command.data.permissions.some(p => 
                ['BAN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_MESSAGES', 'ADMINISTRATOR'].includes(p)
            )) {
                adminCommands.push(command.data.name);
            } else if (command.data.name.includes('role') || command.data.name.includes('channel')) {
                controlCommands.push(command.data.name);
            } else if (['fun', 'game', 'joke', 'meme', '8ball', 'dice'].some(fun => command.data.name.includes(fun))) {
                funCommands.push(command.data.name);
            } else {
                generalCommands.push(command.data.name);
            }
        });

        const embed = new EmbedBuilder()
            .setTitle('📋 قائمة الأوامر')
            .setDescription(`**استخدم** \`${config.prefix}help <command>\` **للحصول على معلومات مفصلة عن أمر معين**`)
            .setColor(config.colors.info)
            .setTimestamp()
            .setFooter({ text: `${client.user.username} | ${message.guild.name}`, iconURL: client.user.displayAvatarURL() });

        if (adminCommands.length > 0) {
            embed.addFields({
                name: '🛡️ الأوامر الإدارية',
                value: adminCommands.map(cmd => `\`${cmd}\``).join(' • '),
                inline: false
            });
        }

        if (generalCommands.length > 0) {
            embed.addFields({
                name: '📊 الأوامر العامة',
                value: generalCommands.map(cmd => `\`${cmd}\``).join(' • '),
                inline: false
            });
        }

        if (controlCommands.length > 0) {
            embed.addFields({
                name: '⚙️ أوامر التحكم',
                value: controlCommands.map(cmd => `\`${cmd}\``).join(' • '),
                inline: false
            });
        }

        if (funCommands.length > 0) {
            embed.addFields({
                name: '🎮 أوامر الترفيه',
                value: funCommands.map(cmd => `\`${cmd}\``).join(' • '),
                inline: false
            });
        }

        embed.addFields({
            name: '🔗 روابط مفيدة',
            value: `[دعوة البوت](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8) | [الدعم](https://discord.gg/support)`,
            inline: false
        });

        await message.reply({ embeds: [embed] });
    }
}; 