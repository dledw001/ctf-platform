const bcrypt = require('bcrypt');
const pool = require('../db/pool');

async function ensureAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        return;
    }

    const existingAdmin = await pool.query(
        'SELECT id FROM users WHERE is_admin = TRUE LIMIT 1'
    );
    if (existingAdmin.rows.length > 0) {
        return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO users (email, password_hash, is_admin)
     VALUES ($1, $2, TRUE)`,
        [cleanEmail, passwordHash]
    );

    console.log(`Admin user bootstrapped with email: ${cleanEmail}`);
}

module.exports = { ensureAdmin };
