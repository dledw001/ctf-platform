const bcrypt = require('bcrypt');
const pool = require('./pool');
const {hashFlag} = require('../utils/flag');

async function seed() {
    console.log('Seeding database with demo data...');

    /*
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Password123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    const adminRes = await pool.query(
        `INSERT INTO users (email, password_hash, is_admin)
         VALUES ($1, $2, TRUE)
         RETURNING id;`,
        [adminEmail, adminPasswordHash]
    );
    const adminId = adminRes.rows[0].id;
    console.log(`Admin user created: ${adminEmail} (id=${adminId})`);
     */

    const challenges = [
        {
            title: 'Demo Challenge 1',
            description: 'An easy challenge to demonstrate the platform.',
            flag: 'FLAG{demo flag}',
            difficulty: 'easy',
            points: 100,
        },

        {
            title: 'Demo Challenge 2',
            description: 'A medium challenge to demonstrate the platform.',
            flag: 'FLAG{demo flag}',
            difficulty: 'medium',
            points: 200,
        },

        {
            title: 'Demo Challenge 3',
            description: 'A hard challenge to demonstrate the platform.',
            flag: 'FLAG{demo flag}',
            difficulty: 'hard',
            points: 300,
        },
    ];

    for (const challenge of challenges) {
        const flagHash = hashFlag(challenge.flag);

        const res = await pool.query(
            `INSERT INTO challenges (title, description, flag_hash, difficulty, points)
             SELECT $1, $2, $3, $4, $5
             WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = $1)
             RETURNING id;`,
            [challenge.title, challenge.description, flagHash, challenge.difficulty, challenge.points]
        );

        if (res.rows.length > 0) {
            console.log(`Challenge created: ${challenge.title} (id=${res.rows[0].id})`);
        } else {
            console.log(`Challenge already exists, skipping: ${challenge.title}`);
        }
    }

    console.log('Database seeded successfully.');
}

seed().catch((err) => {
    console.error('Error seeding database:', err);
    process.exitCode = 1;
}).finally(async () => {
    await pool.end();
});