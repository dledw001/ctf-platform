const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookie(res, payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7 days',
    });

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // set to true in prod (HTTPS)
        maxAge: COOKIE_MAX_AGE
    });
}

function toPublicUser(row) {
    return {
        id: row.id,
        email: row.email,
        isAdmin: row.is_admin,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({error: 'Email and password required'});
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || password.length < 8) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [cleanEmail]
        );

        if (existing.rows.length > 0){
            return res.status(400).json({error: 'Email already registered'});
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const insert = await pool.query(
            `INSERT INTO users (email, password_hash, is_admin)
             VALUES ($1, $2, FALSE)
             RETURNING id, email, is_admin, created_at`,
            [cleanEmail, passwordHash]
        );

        const user = insert.rows[0];

        setAuthCookie(res, {userId: user.id, isAdmin: user.is_admin });

        res.status(201).json(toPublicUser(user));

    } catch (err) {
        next(err)
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({error: 'Email and password required'});
        }

        const cleanEmail = email.trim().toLowerCase();

        const result = await pool.query(
            'SELECT id, email, password_hash, is_admin, created_at FROM users WHERE email = $1',
            [cleanEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        const user = result.rows[0];

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        setAuthCookie(res, { userId: user.id, isAdmin: user.is_admin });

        res.status(200).json(toPublicUser(user));
    } catch(err) {
        next(err);
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });
    res.json({success: true});
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
    try {
        if (!req.cookies) {
            return res.status(200).json({ user: null });
        }

        const token = req.cookies[COOKIE_NAME];
        if (!token) {
            return res.status(200).json({user: null});
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(200).json({user: null});
        }

        const result = await pool.query(
            'SELECT id, email, is_admin, created_at FROM users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({user: null});
        }

        const user = result.rows[0];

        res.status(200).json({ user: toPublicUser(user) });
    } catch(err) {
        next(err);
    }
});

module.exports = router;