const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');

router.use('/auth', authRoutes);

// test route
router.get('/test', (req, res) => {
    res.json({message: 'CTF API up and running...'});
});

module.exports = router;