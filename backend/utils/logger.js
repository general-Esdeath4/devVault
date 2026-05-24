const Activity = require('../models/Activity');

/**
 * Kullanıcı aktivitesini veritabanına kaydeder
 * @param {string} userId - İşlemi yapan kullanıcının ID'si
 * @param {string} action - İşlem tipi (örn: 'CREATE_PROJECT')
 * @param {string} details - İşlemin kısa açıklaması (örn: '"React Projesi" adlı projeyi oluşturdu')
 */
const logActivity = async (userId, action, details) => {
    try {
        await Activity.create({
            user: userId,
            action,
            details,
        });
    } catch (error) {
        console.error('Aktivite günlük kaydı oluşturulurken hata:', error);
    }
};

module.exports = logActivity;
