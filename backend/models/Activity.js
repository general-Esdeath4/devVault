const mongoose = require('mongoose');

const activitySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // User modeli ile ilişki
        },
        action: {
            type: String,
            required: true, // Örn: 'CREATE_PROJECT', 'DELETE_SNIPPET', etc.
        },
        details: {
            type: String,
            required: true, // Örn: '"DevVault" adlı projeyi oluşturdu'
        },
    },
    { timestamps: true } // updatedAt ve createdAt alanlarını otomatik ekler
);

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
