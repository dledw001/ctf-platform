const bcrypt = require('bcrypt');
const pool = require('./pool');
const { hashFlag } = require('../utils/flag');

async function getOrCreateUser(email, password, { isAdmin = false, score = 0 } = {}) {
    const existing = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
    );

    if (existing.rows.length > 0) {
        const id = existing.rows[0].id;
        await pool.query(
            `UPDATE users
             SET is_admin = $2,
                 score = $3,
                 updated_at = NOW()
             WHERE id = $1`,
            [id, isAdmin, score]
        );
        console.log(`User already exists, updated: ${email} (id=${id})`);
        return id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const res = await pool.query(
        `INSERT INTO users (email, password_hash, is_admin, score)
         VALUES ($1, $2, $3, $4)
         RETURNING id;`,
        [email, passwordHash, isAdmin, score]
    );

    const id = res.rows[0].id;
    console.log(`User created: ${email} (id=${id}, is_admin=${isAdmin}, score=${score})`);
    return id;
}

async function getOrCreateChallenge({ title, description, flag, difficulty, points }) {
    const existing = await pool.query(
        `SELECT id, flag_hash, points, difficulty FROM challenges WHERE title = $1`,
        [title]
    );

    if (existing.rows.length > 0) {
        const row = existing.rows[0];
        console.log(
            `Challenge already exists, using existing: ${title} (id=${row.id}, difficulty=${row.difficulty}, points=${row.points})`
        );
        return {
            id: row.id,
            title,
            flag,
            flagHash: row.flag_hash,
            points: row.points,
            difficulty: row.difficulty,
        };
    }

    const flagHash = hashFlag(flag);

    const res = await pool.query(
        `INSERT INTO challenges (title, description, flag_hash, difficulty, points)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id;`,
        [title, description, flagHash, difficulty, points]
    );

    const id = res.rows[0].id;
    console.log(`Challenge created: ${title} (id=${id}, difficulty=${difficulty}, points=${points})`);

    return { id, title, flag, flagHash, points, difficulty };
}

async function createSubmissionIfMissing({ userId, challenge, isCorrect }) {
    const { id: challengeId, flagHash, title } = challenge;

    const existing = await pool.query(
        `SELECT id FROM submissions
         WHERE user_id = $1
           AND challenge_id = $2
           AND is_correct = $3
         LIMIT 1;`,
        [userId, challengeId, isCorrect]
    );

    if (existing.rows.length > 0) {
        console.log(
            `Submission already exists for user_id=${userId}, challenge_id=${challengeId}, is_correct=${isCorrect}`
        );
        return;
    }

    const submittedFlagHash = isCorrect
        ? flagHash
        : hashFlag(`WRONG{${title}}`);

    await pool.query(
        `INSERT INTO submissions (user_id, challenge_id, submitted_flag_hash, is_correct)
         VALUES ($1, $2, $3, $4);`,
        [userId, challengeId, submittedFlagHash, isCorrect]
    );

    console.log(
        `Submission created for user_id=${userId}, challenge_id=${challengeId}, is_correct=${isCorrect}`
    );
}

async function seed() {

    if (process.env.ALLOW_SEED_DEMO !== 'true') {
        console.error('Demo seeding is disabled. Set ALLOW_SEED_DEMO=true to enable.');
        process.exit(1);
    }

    console.log('Seeding database with demo data...');

    const adminEmail = 'admin@example.com';
    const user1Email = 'user1@example.com';
    const user2Email = 'user2@example.com';
    const demoPassword = 'changeme';

    const adminId = await getOrCreateUser(adminEmail, demoPassword, {
        isAdmin: true,
        score: 0,
    });
    const user1Id = await getOrCreateUser(user1Email, demoPassword, {
        isAdmin: false,
        score: 0,
    });
    const user2Id = await getOrCreateUser(user2Email, demoPassword, {
        isAdmin: false,
        score: 0,
    });

    const challengeSpecs = [
        {
            title: 'Basic Challenge',
            description:
                'A very easy challenge. Submit your answer below. Submissions are case-sensitive.',
            flag: 'FLAG{basic-flag}',
            difficulty: 'easy',
            points: 100,
        },
        {
            title: 'Medium Challenge',
            description:
                'A modest challenge. Submit your answer below. Submissions are case-sensitive.',
            flag: 'FLAG{medium-flag}',
            difficulty: 'medium',
            points: 300,
        },
        {
            title: 'Difficult Challenge',
            description:
                'A very difficult challenge. Submit your answer below. Submissions are case-sensitive.',
            flag: 'FLAG{difficult-flag}',
            difficulty: 'hard',
            points: 500,
        },
    ];

    const challenges = [];
    for (const spec of challengeSpecs) {
        const ch = await getOrCreateChallenge(spec);
        challenges.push(ch);
    }

    const [easy, medium, hard] = challenges;

    let adminScore = 0;
    let user1Score = 0;
    let user2Score = 0;

    await createSubmissionIfMissing({
        userId: adminId,
        challenge: easy,
        isCorrect: false,
    });

    await createSubmissionIfMissing({
        userId: adminId,
        challenge: easy,
        isCorrect: true,
    });
    adminScore += easy.points;

    await createSubmissionIfMissing({
        userId: adminId,
        challenge: medium,
        isCorrect: false,
    });

    await createSubmissionIfMissing({
        userId: adminId,
        challenge: hard,
        isCorrect: false,
    });

    await createSubmissionIfMissing({
        userId: user1Id,
        challenge: easy,
        isCorrect: true,
    });
    user1Score += easy.points;

    await createSubmissionIfMissing({
        userId: user1Id,
        challenge: medium,
        isCorrect: true,
    });
    user1Score += medium.points;

    await createSubmissionIfMissing({
        userId: user1Id,
        challenge: hard,
        isCorrect: false,
    });

    await createSubmissionIfMissing({
        userId: user2Id,
        challenge: medium,
        isCorrect: true,
    });
    user2Score += medium.points;

    await createSubmissionIfMissing({
        userId: user2Id,
        challenge: hard,
        isCorrect: true,
    });
    user2Score += hard.points;


    await pool.query(
        `UPDATE users SET score = $2, updated_at = NOW() WHERE id = $1`,
        [adminId, adminScore]
    );
    await pool.query(
        `UPDATE users SET score = $2, updated_at = NOW() WHERE id = $1`,
        [user1Id, user1Score]
    );
    await pool.query(
        `UPDATE users SET score = $2, updated_at = NOW() WHERE id = $1`,
        [user2Id, user2Score]
    );

    console.log('Database seeded successfully.');
}

seed()
    .catch((err) => {
        console.error('Error seeding database:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
