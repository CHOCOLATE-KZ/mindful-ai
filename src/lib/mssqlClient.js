// MSSQL client for Node.js
// Используйте этот модуль для подключения к локальной базе через SSMS

const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
    server: process.env.DB_SERVER || 'localhost', // или IP
    database: process.env.DB_NAME || 'your_db',
    options: {
        encrypt: false, // true для Azure
        trustServerCertificate: true // для локального
    }
};

async function connect() {
    try {
        if (!sql.pool) {
            sql.pool = await sql.connect(config);
        }
        return sql.pool;
    } catch (err) {
        console.error('Ошибка подключения к MSSQL:', err);
        throw err;
    }
}

async function query(q, params = {}) {
    const pool = await connect();
    const request = pool.request();
    for (const key in params) {
        request.input(key, params[key]);
    }
    return request.query(q);
}

module.exports = { connect, query, sql };
