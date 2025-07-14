require('dotenv').config();

module.exports = {
    token: process.env.TOKEN || 'YOUR_BOT_TOKEN_HERE',
    prefix: process.env.PREFIX || '!',
    ownerId: process.env.OWNER_ID || 'YOUR_DISCORD_ID_HERE',
    databaseName: process.env.DATABASE_NAME || 'bot_database.sqlite',
    logChannelId: process.env.LOG_CHANNEL_ID || 'YOUR_LOG_CHANNEL_ID_HERE',
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID || 'YOUR_WELCOME_CHANNEL_ID_HERE',
    
    colors: {
        success: 0x00FF00,
        error: 0xFF0000,
        warning: 0xFFFF00,
        info: 0x0099FF,
        default: 0x7289DA
    },
    
    permissions: {
        admin: ['ADMINISTRATOR'],
        mod: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
        staff: ['MANAGE_MESSAGES']
    }
}; 