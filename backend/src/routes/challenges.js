const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { hashFlag } = require('../utils/flag');

const router = express.Router();

// helper to return a challenge for public viewing (no flag)
function toPublicChallenge(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        difficulty: row.difficulty,
        points: row.points,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// helper to recompute scores after changes (e.g. deleted submissions)
async function recomputeScores(client) {
    await client.query(
        `UPDATE users u
        SET score = COALESCE((
        SELECT SUM(c.points)
        FROM submissions s
        JOIN challenges c ON c.id = s.challenge_id
        WHERE s.user_id = u.id
        AND s.is_correct = TRUE
        ), 0),
        updated_at = NOW()`
    );
}

// GET /api/challenges - READ public list (no flag)
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, difficulty, points, created_at, updated_at
            FROM challenges
            ORDER BY points DESC`
        );
        res.status(200).json(result.rows.map(toPublicChallenge))
    } catch (err) {
        next(err);
    }
});

// GET /api/challenges/:id - READ public details (no flag)
router.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: 'Invalid challenge id'});
        }

        const result = await pool.query(
            `SELECT id, title, description, difficulty, points, created_at, updated_at
             FROM challenges WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Challenge not found'});
        }

        res.status(200).json(toPublicChallenge(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

// POST /api/challenges CREATE (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const { title, description, flag, difficulty, points } = req.body;

        if (typeof title !== 'string' || typeof description !== 'string' ||
            typeof flag !== 'string' || typeof difficulty !== 'string') {
            return res.status(400).json({error: 'Invalid challenge data'});
        }

        const numericPoints = Number(points);
        if (!Number.isInteger(numericPoints) || numericPoints <= 0) {
            return res.status(400).json({error: 'Points must be a positive integer'});
        }

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();
        const cleanFlag = flag.trim();
        const cleanDifficulty = difficulty.trim();

        if (!cleanTitle || !cleanDescription || !cleanFlag || !cleanDifficulty) {
            return res.status(400).json({error: 'All fields are required'});
        }

        const allowedDifficulties = new Set(['easy', 'medium', 'hard']);
        if (!allowedDifficulties.has(cleanDifficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty' });
        }

        const flagHash = hashFlag(cleanFlag);

        const insert = await pool.query(
            `INSERT INTO challenges (title, description, flag_hash, difficulty, points)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, title, description, difficulty, points, created_at, updated_at`,
            [cleanTitle, cleanDescription, flagHash, cleanDifficulty, numericPoints]
        )

        const challenge = insert.rows[0];
        res.status(201).json(toPublicChallenge(challenge));

    } catch (err) {
        next(err);
    }

});

// PUT /api/challenges/:id UPDATE (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({error: 'Invalid challenge id'});
        }

        const { title, description, flag, difficulty, points } = req.body;

        if (typeof title !== 'string' || typeof description !== 'string' ||
            typeof flag !== 'string' || typeof difficulty !== 'string') {
            return res.status(400).json({error: 'Invalid challenge data'});
        }

        const numericPoints = Number(points);
        if (!Number.isInteger(numericPoints) || numericPoints <= 0) {
            return res.status(400).json({error: 'Points must be a positive integer'});
        }

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();
        const cleanFlag = flag.trim();
        const cleanDifficulty = difficulty.trim();

        if (!cleanTitle || !cleanDescription || !cleanFlag || !cleanDifficulty) {
            return res.status(400).json({error: 'All fields are required'});
        }

        const allowedDifficulties = new Set(['easy', 'medium', 'hard']);
        if (!allowedDifficulties.has(cleanDifficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty' });
        }

        const flagHash = hashFlag(cleanFlag);

        const update = await pool.query(
            `UPDATE challenges
            SET title = $1,
            description = $2,
            flag_hash = $3,
            difficulty = $4,
            points = $5,
            updated_at = NOW()
            WHERE id = $6
            RETURNING id, title, description, difficulty, points, created_at, updated_at`,
            [cleanTitle, cleanDescription, flagHash, cleanDifficulty, numericPoints, id]
        );

        if (update.rows.length === 0) {
            return res.status(404).json({error: 'Challenge not found'});
        }

        const challenge = update.rows[0];
        res.status(200).json(toPublicChallenge(challenge));
    } catch (err) {
        next(err);
    }
});

// DELETE /api/challenges/:id DELETE (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
    const client = await pool.connect();

    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            client.release();
            return res.status(400).json({ error: 'Invalid challenge id' });
        }

        await client.query('BEGIN');

        const result = await client.query(
            'DELETE FROM challenges WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: 'Challenge not found' });
        }

        await recomputeScores(client);

        await client.query('COMMIT');

        res.status(204).send();
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (_) {}
        next(err);
    } finally {
        client.release();
    }
});

module.exports = router;