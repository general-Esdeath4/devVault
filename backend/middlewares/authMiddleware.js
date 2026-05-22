const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı header'dan al ("Bearer <token>" formatında gelir)
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token içindeki id ile kullanıcıyı bul ve req.user içerisine ekle (şifreyi dahil etme)
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                res.status(401);
                return next(new Error('Kullanıcı bulunamadı, yetkisiz erişim'));
            }

            return next();
        } catch (error) {
            res.status(401);
            return next(new Error('Yetkisiz erişim, token geçersiz veya süresi dolmuş'));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Yetkisiz erişim, token bulunamadı'));
    }
};

module.exports = { protect };
