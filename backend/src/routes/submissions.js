const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { hashFlag } = require('../utils/flag');

const router = express.Router();

// POST /api/submissions - users may CREATE submissions
router.post('/', requireAuth, async (req, res, next) => {
    const client = await pool.connect();

    try {
       const { challengeId, flag } = req.body;

       const id = Number(challengeId);
       if(!Number.isInteger(id) || id <= 0) {
           return res.status(400).json({error: 'Invalid challenge id'});
       }

       if (typeof flag !== 'string') {
           return res.status(400).json({error: 'Invalid flag'});
       }

       const cleanFlag = flag.trim();
       if (!cleanFlag) {
           return res.status(400).json({error: 'Flag is required'});
       }

       const userId = req.user.id;
       if(!userId) {
           return res.status(401).json({error: 'Unauthorized'});
       }

       await client.query('BEGIN');

       const challengeRes = await client.query(
         `SELECT id, flag_hash, title, points
         FROM challenges WHERE id = $1`,
         [id]
       );

       if (challengeRes.rows.length === 0) {
           await client.query('ROLLBACK');
           return res.status(404).json({error: 'Challenge not found'});
       }

       const challenge = challengeRes.rows[0];

       const submittedHash = hashFlag(cleanFlag);
       const isCorrect = submittedHash === challenge.flag_hash;

       const insert = await client.query(
           `INSERT INTO submissions (user_id, challenge_id, submitted_flag_hash, is_correct) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, user_id, challenge_id, is_correct, created_at`,
           [userId, id, submittedHash, isCorrect]
       );

       if (isCorrect) {
           await client.query(
                `UPDATE users 
                SET score = score + $1, 
                updated_at = NOW() 
                WHERE id = $2`,
                [challenge.points, userId]
           );
       }

       await client.query('COMMIT');

       const submission = insert.rows[0];

       return res.status(201).json({
           correct: isCorrect,
           submission: {
               id: submission.id,
               challengeId: submission.challenge_id,
               isCorrect: submission.is_correct,
               createdAt: submission.created_at,
           },
       });
   }  catch (err) {
       if (err.code === '23505') {
           await client.query('ROLLBACK');
           return res.status(409).json({
               error: 'You have already solved this challenge',
               correct: true,
           });
       }

       try {
           await client.query('ROLLBACK');
       } catch (_) {}
        next(err);
   } finally {
       client.release();
   }
});

// GET /api/submissions - Admins may READ submissions
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
   try {
       const result = await pool.query(
            `SELECT s.id, 
            s.created_at, 
            s.is_correct, 
            u.email AS user_email, 
            c.id AS challenge_id, 
            c.title AS challenge_title,
            c.description AS challenge_description, 
            c.difficulty AS challenge_difficulty, 
            c.points AS challenge_points
            FROM submissions s
            JOIN users u ON s.user_id = u.id 
            JOIN challenges c ON s.challenge_id = c.id`
       );

       const submissions = result.rows.map(row => ({
           id: row.id,
           createdAt: row.created_at,
           isCorrect: row.is_correct,
           userEmail: row.user_email,
           challengeId: row.challenge_id,
           challengeTitle: row.challenge_title,
           challengeDescription: row.challenge_description,
           challengeDifficulty: row.challenge_difficulty,
           challengePoints: row.challenge_points,
       }));

       return res.status(200).json(submissions);
   } catch (err) {
       next(err);
   }
});

module.exports = router;