const pool = require('../src/db/pool');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const TEST_PASSWORD_HASH = '';

async function resetDb() {
    await pool.query(
        `TRUNCATE TABLE submissions, challenges, users RESTART IDENTITY CASCADE`
    );
}

async function closeDb() {
    await pool.end();
}

function buildAuthCookie(userId, isAdmin) {
    const token = jwt.sign(
        { userId, isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return [`${COOKIE_NAME}=${token}`];
}

async function createTestUser({ email, isAdmin = false } = {}) {
    const finalEmail = email || (isAdmin ? 'admin@example.com' : 'user@example.com');

    const result = await pool.query(
        `INSERT INTO users (email, password_hash, is_admin)
        VALUES ($1, $2, $3)
        RETURNING id, email, is_admin, created_at`,
        [finalEmail, TEST_PASSWORD_HASH, isAdmin]
    );

    const user = result.rows[0];
    const cookie = buildAuthCookie(user.id, user.is_admin);

    return { user, cookie };
}

async function createAdminUser(email = 'admin@example.com') {
    return createTestUser({ email, isAdmin: true });
}

async function createNormalUser(email = 'user@example.com') {
    return createTestUser({ email, isAdmin: false });
}

module.exports = {
    resetDb,
    closeDb,
    createAdminUser,
    createNormalUser,
};