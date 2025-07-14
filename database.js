const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
    constructor() {
        this.db = new sqlite3.Database(config.databaseName);
        this.init();
    }

    init() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT,
                    discriminator TEXT,
                    avatar TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    level INTEGER DEFAULT 1,
                    xp INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    warnings INTEGER DEFAULT 0,
                    muted_until DATETIME,
                    banned BOOLEAN DEFAULT 0,
                    last_daily DATETIME,
                    last_work DATETIME
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS guilds (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    owner_id TEXT,
                    prefix TEXT DEFAULT '!',
                    welcome_channel TEXT,
                    log_channel TEXT,
                    auto_role TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS warnings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    guild_id TEXT,
                    moderator_id TEXT,
                    reason TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS punishments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    guild_id TEXT,
                    moderator_id TEXT,
                    type TEXT,
                    reason TEXT,
                    duration INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS autoroles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    guild_id TEXT,
                    role_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS tickets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    guild_id TEXT,
                    channel_id TEXT,
                    status TEXT DEFAULT 'open',
                    reason TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });
    }

    getUserData(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    createUser(userData) {
        return new Promise((resolve, reject) => {
            const { id, username, discriminator, avatar } = userData;
            this.db.run(
                'INSERT OR IGNORE INTO users (id, username, discriminator, avatar) VALUES (?, ?, ?, ?)',
                [id, username, discriminator, avatar],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    updateUserXP(userId, xp) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET xp = xp + ? WHERE id = ?',
                [xp, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    addWarning(userId, guildId, moderatorId, reason) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO warnings (user_id, guild_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
                [userId, guildId, moderatorId, reason],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    getUserWarnings(userId, guildId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?',
                [userId, guildId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    addPunishment(userId, guildId, moderatorId, type, reason, duration = null) {
        return new Promise((resolve, reject) => {
            let expiresAt = null;
            if (duration) {
                expiresAt = new Date(Date.now() + duration * 1000);
            }
            
            this.db.run(
                'INSERT INTO punishments (user_id, guild_id, moderator_id, type, reason, duration, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, guildId, moderatorId, type, reason, duration, expiresAt],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    updateUserCoins(userId, coins) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET coins = coins + ? WHERE id = ?',
                [coins, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    setUserCoins(userId, coins) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET coins = ? WHERE id = ?',
                [coins, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    updateUserLevel(userId, level) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET level = ? WHERE id = ?',
                [level, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    getLeaderboard(type = 'coins', limit = 10) {
        return new Promise((resolve, reject) => {
            const orderBy = type === 'xp' ? 'xp' : 'coins';
            this.db.all(
                `SELECT * FROM users ORDER BY ${orderBy} DESC LIMIT ?`,
                [limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = new Database(); 