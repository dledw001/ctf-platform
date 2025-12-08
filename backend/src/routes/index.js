const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const challengesRoutes = require('./challenges');
const submissionsRoutes = require('./submissions');

router.use('/auth', authRoutes);
router.use('/challenges', challengesRoutes);
router.use('/submissions', submissionsRoutes);

module.exports = router;