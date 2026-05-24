const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getActivities);

module.exports = router;
