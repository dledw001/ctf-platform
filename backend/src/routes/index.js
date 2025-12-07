const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const challengesRoutes = require('./challenges');

router.use('/auth', authRoutes);
router.use('/challenges', challengesRoutes);

// test route
router.get('/test', (req, res) => {
    res.json({message: 'CTF API up and running...'});
});

module.exports = router;