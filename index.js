const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const database = require('./database');
const Utils = require('./utils');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
    
    console.log(`✅ Loaded ${client.commands.size} commands.`);
} else {
    console.log('[ERROR] Commands directory not found!');
}

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    
    client.user.setActivity({
        name: `${config.prefix}help | ${client.guilds.cache.size} servers`,
        type: ActivityType.Watching
    });

    setInterval(() => {
        client.user.setActivity({
            name: `${config.prefix}help | ${client.guilds.cache.size} servers`,
            type: ActivityType.Watching
        });
    }, 300000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName));

    if (!command) return;

    const { cooldowns } = client;
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = (command.data.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const embed = Utils.createErrorEmbed(
                '⏰ Cooldown',
                `يجب الانتظار ${timeLeft.toFixed(1)} ثانية قبل استخدام هذا الأمر مرة أخرى.`
            );
            return message.reply({ embeds: [embed] });
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        const embed = Utils.createErrorEmbed(
            '❌ خطأ',
            'حدث خطأ أثناء تنفيذ هذا الأمر!'
        );
        
        if (message.replied || message.deferred) {
            await message.followUp({ embeds: [embed] });
        } else {
            await message.reply({ embeds: [embed] });
        }
    }
});

client.on('guildMemberAdd', async (member) => {
    try {
        await database.createUser({
            id: member.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            avatar: member.user.avatar
        });

        const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (welcomeChannel) {
            const embed = Utils.createSuccessEmbed(
                '🎉 مرحباً!',
                `مرحباً ${member}! \n\n` +
                `🎯 أنت العضو رقم **${member.guild.memberCount}**\n` +
                `📅 تم إنشاء الحساب: ${Utils.formatDate(member.user.createdAt)}\n` +
                `🔗 انضم للسيرفر: ${Utils.formatDate(member.joinedAt)}`
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() });

            await welcomeChannel.send({ embeds: [embed] });
        }

        const logEmbed = Utils.createInfoEmbed(
            '📥 عضو جديد',
            `**العضو:** ${member.user.tag} (${member.id})\n` +
            `**الحساب:** ${Utils.formatDate(member.user.createdAt)}\n` +
            `**الانضمام:** ${Utils.formatDate(member.joinedAt)}`
        );

        await Utils.sendLog(client, logEmbed);

    } catch (error) {
        console.error('Error in guildMemberAdd:', error);
    }
});

client.on('guildMemberRemove', async (member) => {
    try {
        const logEmbed = Utils.createWarningEmbed(
            '📤 عضو غادر',
            `**العضو:** ${member.user.tag} (${member.id})\n` +
            `**الانضمام:** ${Utils.formatDate(member.joinedAt)}\n` +
            `**المغادرة:** ${Utils.formatDate(new Date())}`
        );

        await Utils.sendLog(client, logEmbed);

    } catch (error) {
        console.error('Error in guildMemberRemove:', error);
    }
});

client.on('messageDelete', async (message) => {
    if (message.author.bot) return;
    
    try {
        const logEmbed = Utils.createErrorEmbed(
            '🗑️ رسالة محذوفة',
            `**المؤلف:** ${message.author.tag}\n` +
            `**القناة:** ${message.channel}\n` +
            `**المحتوى:** ${Utils.truncateString(message.content || 'لا يوجد محتوى', 100)}\n` +
            `**التاريخ:** ${Utils.formatDate(new Date())}`
        );

        await Utils.sendLog(client, logEmbed);

    } catch (error) {
        console.error('Error in messageDelete:', error);
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;
    
    try {
        const logEmbed = Utils.createWarningEmbed(
            '📝 رسالة معدلة',
            `**المؤلف:** ${oldMessage.author.tag}\n` +
            `**القناة:** ${oldMessage.channel}\n` +
            `**قبل:** ${Utils.truncateString(oldMessage.content || 'لا يوجد محتوى', 100)}\n` +
            `**بعد:** ${Utils.truncateString(newMessage.content || 'لا يوجد محتوى', 100)}\n` +
            `**التاريخ:** ${Utils.formatDate(new Date())}`
        );

        await Utils.sendLog(client, logEmbed);

    } catch (error) {
        console.error('Error in messageUpdate:', error);
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

client.login(config.token); 