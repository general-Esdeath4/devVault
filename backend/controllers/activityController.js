const Activity = require('../models/Activity');

// @desc    Kullanıcıya ait son aktiviteleri getir (limit: 20)
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500);
        throw new Error('Aktiviteler getirilemedi');
    }
};

module.exports = {
    getActivities
};
