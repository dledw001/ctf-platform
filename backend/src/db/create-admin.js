const bcrypt = require('bcrypt');
const pool = require('./pool');

async function main() {
    const [,, rawEmail, rawPassword] = process.argv;

    if (!rawEmail || !rawPassword) {
        console.error('Usage: npm run create-admin -- <email> <password>');
        process.exit(1);
    }

    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword.trim();

    if (!email || password.length < 8) {
        console.error('Email required and password must be at least 8 characters.');
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await pool.query(
        'SELECT id, is_admin FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        const user = existing.rows[0];

        if (user.is_admin) {
            console.log(`User ${email} is already an admin (id=${user.id}).`);
        } else {
            await pool.query(
                'UPDATE users SET is_admin = TRUE, updated_at = NOW() WHERE id = $1',
                [user.id]
            );
            console.log(`Promoted existing user ${email} (id=${user.id}) to admin.`);
        }
    } else {
        const insert = await pool.query(
            `INSERT INTO users (email, password_hash, is_admin)
             VALUES ($1, $2, TRUE)
             RETURNING id`,
            [email, passwordHash]
        );
        const user = insert.rows[0];
        console.log(`Created new admin user ${email} (id=${user.id}).`);
    }
}

main().catch((err) => {
    console.error('Error creating admin:', err);
    process.exitCode = 1;
}).finally(async () => {
    await pool.end();
});