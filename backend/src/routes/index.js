const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const challengesRoutes = require('./challenges');

router.use('/auth', authRoutes);
router.use('/challenges', challengesRoutes);

module.exports = router;