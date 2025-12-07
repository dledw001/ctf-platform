const pool = require('../src/db/pool');

async function resetDb() {
    await pool
        .query('TRUNCATE submissions RESTART IDENTITY CASCADE;')
        .catch(() => {});
    await pool
        .query('TRUNCATE challenges RESTART IDENTITY CASCADE;')
        .catch(() => {});
    await pool
        .query('TRUNCATE users RESTART IDENTITY CASCADE;')
        .catch(() => {});
}

async function closeDb() {
    await pool.end();
}

module.exports = { resetDb, closeDb, pool };