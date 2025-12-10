const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const challengesRoutes = require('./challenges');
const submissionsRoutes = require('./submissions');
const scoreboardRoutes = require('./scoreboard');

router.use('/auth', authRoutes);
router.use('/challenges', challengesRoutes);
router.use('/submissions', submissionsRoutes);
router.use('/scoreboard', scoreboardRoutes);

module.exports = router;