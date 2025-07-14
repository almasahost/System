const Utils = require('../utils');

module.exports = {
    data: {
        name: 'membercount',
        description: 'عرض إحصائيات أعضاء السيرفر',
        usage: 'membercount',
        aliases: ['members', 'mc', 'count'],
        cooldown: 5
    },
    
    async execute(message) {
        const guild = message.guild;
        
        const totalMembers = guild.memberCount;
        const members = guild.members.cache;
        
        const humans = members.filter(member => !member.user.bot).size;
        const bots = members.filter(member => member.user.bot).size;
        
        const onlineMembers = members.filter(member => member.presence?.status === 'online').size;
        const idleMembers = members.filter(member => member.presence?.status === 'idle').size;
        const dndMembers = members.filter(member => member.presence?.status === 'dnd').size;
        const offlineMembers = members.filter(member => !member.presence || member.presence.status === 'offline').size;

        const embed = Utils.createInfoEmbed(
            '👥 إحصائيات الأعضاء',
            ''
        )
        .setThumbnail(guild.iconURL())
        .addFields(
            { name: '📊 العدد الإجمالي', value: `${totalMembers} عضو`, inline: true },
            { name: '👤 البشر', value: `${humans} عضو`, inline: true },
            { name: '🤖 البوتات', value: `${bots} بوت`, inline: true },
            { name: '🟢 متصل', value: `${onlineMembers}`, inline: true },
            { name: '🟡 غير متفرغ', value: `${idleMembers}`, inline: true },
            { name: '🔴 مشغول', value: `${dndMembers}`, inline: true },
            { name: '⚫ غير متصل', value: `${offlineMembers}`, inline: true },
            { name: '📈 نسبة النشاط', value: `${((onlineMembers + idleMembers + dndMembers) / totalMembers * 100).toFixed(1)}%`, inline: true },
            { name: '🤖 نسبة البوتات', value: `${(bots / totalMembers * 100).toFixed(1)}%`, inline: true }
        )
        .setFooter({ text: guild.name, iconURL: guild.iconURL() })
        .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
}; 