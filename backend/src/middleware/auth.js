const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';

function requireAuth(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({error: 'Authentication required'});
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: payload.userId,
            isAdmin: payload.isAdmin,
        };
        next();
    } catch (err) {
        console.error('JWT verification failed', err);
        return res.status(401).json({error: 'Invalid token'});
    }
}

function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({error: 'Authentication required'});
    }

    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({error: 'Admin privileges required'});
    }
    next();
}

module.exports = {requireAuth, requireAdmin};