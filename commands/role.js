const { PermissionsBitField } = require('discord.js');
const Utils = require('../utils');

module.exports = {
    data: {
        name: 'role',
        description: 'إدارة الأدوار (إضافة/إزالة/إنشاء/حذف)',
        usage: 'role <add|remove|create|delete> <@user|name> [role]',
        aliases: ['r'],
        cooldown: 3,
        permissions: ['MANAGE_ROLES']
    },
    
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'تحتاج إلى صلاحية `MANAGE_ROLES` لاستخدام هذا الأمر.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العملية.\n' +
                '**الاستخدام:**\n' +
                '`!role add @user @role` - إضافة دور لعضو\n' +
                '`!role remove @user @role` - إزالة دور من عضو\n' +
                '`!role create name [color] [hoist] [mentionable]` - إنشاء دور جديد\n' +
                '`!role delete @role` - حذف دور'
            );
            return message.reply({ embeds: [embed] });
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'add':
                await this.addRole(message, args);
                break;
            case 'remove':
                await this.removeRole(message, args);
                break;
            case 'create':
                await this.createRole(message, args);
                break;
            case 'delete':
                await this.deleteRole(message, args);
                break;
            default:
                const embed = Utils.createErrorEmbed(
                    '❌ عملية غير صحيحة',
                    'العمليات المتاحة: `add`, `remove`, `create`, `delete`'
                );
                return message.reply({ embeds: [embed] });
        }
    },

    async addRole(message, args) {
        if (!args[1] || !args[2]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العضو والدور.\n**الاستخدام:** `!role add @user @role`'
            );
            return message.reply({ embeds: [embed] });
        }

        const member = await Utils.findMember(message.guild, args[1]);
        if (!member) {
            const embed = Utils.createErrorEmbed(
                '❌ عضو غير موجود',
                'لم يتم العثور على العضو المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        const role = await Utils.findRole(message.guild, args[2]);
        if (!role) {
            const embed = Utils.createErrorEmbed(
                '❌ دور غير موجود',
                'لم يتم العثور على الدور المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (role.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك إضافة دور أعلى من أو مساوي لدورك الأعلى.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (member.roles.cache.has(role.id)) {
            const embed = Utils.createErrorEmbed(
                '❌ الدور موجود بالفعل',
                `${member.user.tag} لديه هذا الدور بالفعل.`
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            await member.roles.add(role, `تم إضافة الدور بواسطة ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم إضافة الدور',
                `**العضو:** ${member.user.tag}\n**الدور:** ${role.name}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createInfoEmbed(
                '🎭 إضافة دور',
                `**العضو:** ${member.user.tag} (${member.id})\n` +
                `**الدور:** ${role.name} (${role.id})\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error adding role:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء إضافة الدور.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async removeRole(message, args) {
        if (!args[1] || !args[2]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد العضو والدور.\n**الاستخدام:** `!role remove @user @role`'
            );
            return message.reply({ embeds: [embed] });
        }

        const member = await Utils.findMember(message.guild, args[1]);
        if (!member) {
            const embed = Utils.createErrorEmbed(
                '❌ عضو غير موجود',
                'لم يتم العثور على العضو المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        const role = await Utils.findRole(message.guild, args[2]);
        if (!role) {
            const embed = Utils.createErrorEmbed(
                '❌ دور غير موجود',
                'لم يتم العثور على الدور المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (role.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك إزالة دور أعلى من أو مساوي لدورك الأعلى.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (!member.roles.cache.has(role.id)) {
            const embed = Utils.createErrorEmbed(
                '❌ الدور غير موجود',
                `${member.user.tag} ليس لديه هذا الدور.`
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            await member.roles.remove(role, `تم إزالة الدور بواسطة ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم إزالة الدور',
                `**العضو:** ${member.user.tag}\n**الدور:** ${role.name}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createWarningEmbed(
                '🎭 إزالة دور',
                `**العضو:** ${member.user.tag} (${member.id})\n` +
                `**الدور:** ${role.name} (${role.id})\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error removing role:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء إزالة الدور.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async createRole(message, args) {
        if (!args[1]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد اسم الدور.\n**الاستخدام:** `!role create name [color] [hoist] [mentionable]`'
            );
            return message.reply({ embeds: [embed] });
        }

        const name = args[1];
        const color = args[2] || null;
        const hoist = args[3] === 'true';
        const mentionable = args[4] === 'true';

        try {
            const role = await message.guild.roles.create({
                name: name,
                color: color,
                hoist: hoist,
                mentionable: mentionable,
                reason: `تم إنشاء الدور بواسطة ${message.author.tag}`
            });

            const embed = Utils.createSuccessEmbed(
                '✅ تم إنشاء الدور',
                `**الاسم:** ${role.name}\n**اللون:** ${role.hexColor}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createSuccessEmbed(
                '🎭 إنشاء دور جديد',
                `**الاسم:** ${role.name} (${role.id})\n` +
                `**اللون:** ${role.hexColor}\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error creating role:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء إنشاء الدور.'
            );
            await message.reply({ embeds: [embed] });
        }
    },

    async deleteRole(message, args) {
        if (!args[1]) {
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'يجب تحديد الدور.\n**الاستخدام:** `!role delete @role`'
            );
            return message.reply({ embeds: [embed] });
        }

        const role = await Utils.findRole(message.guild, args[1]);
        if (!role) {
            const embed = Utils.createErrorEmbed(
                '❌ دور غير موجود',
                'لم يتم العثور على الدور المحدد.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (role.position >= message.member.roles.highest.position) {
            const embed = Utils.createErrorEmbed(
                '❌ ليس لديك صلاحية',
                'لا يمكنك حذف دور أعلى من أو مساوي لدورك الأعلى.'
            );
            return message.reply({ embeds: [embed] });
        }

        if (role.managed) {
            const embed = Utils.createErrorEmbed(
                '❌ لا يمكن حذف الدور',
                'هذا الدور مُدار بواسطة تطبيق ولا يمكن حذفه.'
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            const roleName = role.name;
            await role.delete(`تم حذف الدور بواسطة ${message.author.tag}`);

            const embed = Utils.createSuccessEmbed(
                '✅ تم حذف الدور',
                `**الاسم:** ${roleName}\n**المشرف:** ${message.author.tag}`
            );

            await message.reply({ embeds: [embed] });

            const logEmbed = Utils.createErrorEmbed(
                '🗑️ حذف دور',
                `**الاسم:** ${roleName} (${role.id})\n` +
                `**المشرف:** ${message.author.tag} (${message.author.id})\n` +
                `**التاريخ:** ${Utils.formatDate(new Date())}`
            );

            await Utils.sendLog(message.client, logEmbed);

        } catch (error) {
            console.error('Error deleting role:', error);
            const embed = Utils.createErrorEmbed(
                '❌ خطأ',
                'حدث خطأ أثناء حذف الدور.'
            );
            await message.reply({ embeds: [embed] });
        }
    }
}; 