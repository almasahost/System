const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('./config');

class Utils {
    static createEmbed(title, description, color = config.colors.default) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }

    static createSuccessEmbed(title, description) {
        return this.createEmbed(title, description, config.colors.success);
    }

    static createErrorEmbed(title, description) {
        return this.createEmbed(title, description, config.colors.error);
    }

    static createWarningEmbed(title, description) {
        return this.createEmbed(title, description, config.colors.warning);
    }

    static createInfoEmbed(title, description) {
        return this.createEmbed(title, description, config.colors.info);
    }

    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    static parseTime(timeString) {
        const timeRegex = /(\d+)([smhd])/g;
        let totalSeconds = 0;
        let match;

        while ((match = timeRegex.exec(timeString)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's':
                    totalSeconds += value;
                    break;
                case 'm':
                    totalSeconds += value * 60;
                    break;
                case 'h':
                    totalSeconds += value * 3600;
                    break;
                case 'd':
                    totalSeconds += value * 86400;
                    break;
            }
        }

        return totalSeconds;
    }

    static hasPermission(member, permissions) {
        if (!member || !member.permissions) return false;
        
        return permissions.some(perm => 
            member.permissions.has(PermissionsBitField.Flags[perm])
        );
    }

    static isOwner(userId) {
        return userId === config.ownerId;
    }

    static isAdmin(member) {
        return this.hasPermission(member, config.permissions.admin) || this.isOwner(member.id);
    }

    static isModerator(member) {
        return this.hasPermission(member, config.permissions.mod) || this.isAdmin(member);
    }

    static isStaff(member) {
        return this.hasPermission(member, config.permissions.staff) || this.isModerator(member);
    }

    static async sendLog(client, embed) {
        try {
            const logChannel = client.channels.cache.get(config.logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error sending log:', error);
        }
    }

    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static truncateString(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    }

    static getRandomColor() {
        return Math.floor(Math.random() * 16777215);
    }

    static formatDate(date) {
        return new Date(date).toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getMemberHighestRole(member) {
        return member.roles.highest;
    }

    static async findMember(guild, query) {
        if (!query) return null;
        
        const mention = query.match(/^<@!?(\d+)>$/);
        if (mention) {
            return guild.members.cache.get(mention[1]);
        }

        if (/^\d+$/.test(query)) {
            return guild.members.cache.get(query);
        }

        return guild.members.cache.find(member => 
            member.user.username.toLowerCase().includes(query.toLowerCase()) ||
            member.displayName.toLowerCase().includes(query.toLowerCase())
        );
    }

    static async findRole(guild, query) {
        if (!query) return null;
        
        const mention = query.match(/^<@&(\d+)>$/);
        if (mention) {
            return guild.roles.cache.get(mention[1]);
        }

        if (/^\d+$/.test(query)) {
            return guild.roles.cache.get(query);
        }

        return guild.roles.cache.find(role => 
            role.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    static async findChannel(guild, query) {
        if (!query) return null;
        
        const mention = query.match(/^<#(\d+)>$/);
        if (mention) {
            return guild.channels.cache.get(mention[1]);
        }

        if (/^\d+$/.test(query)) {
            return guild.channels.cache.get(query);
        }

        return guild.channels.cache.find(channel => 
            channel.name.toLowerCase().includes(query.toLowerCase())
        );
    }
}

module.exports = Utils; 