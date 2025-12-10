const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, email, score, created_at
            FROM users
            WHERE score > 0
            ORDER BY score DESC, created_at ASC`
        );

        const rows = result.rows.map(row => ({
            id: row.id,
                email: row.email,
                score: row.score,
                createdAt: row.created_at,
        }));

        res.status(200).json(rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;