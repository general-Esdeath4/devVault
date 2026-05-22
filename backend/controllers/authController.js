const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Lütfen tüm alanları doldurun');
    }

    // E-posta kullanılıyor mu kontrolü
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }

    // Kullanıcıyı oluştur
    const user = await User.create({
        username,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Geçersiz kullanıcı verisi');
    }
};

// @desc    Kullanıcı girişi (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Şifre kontrolü user.matchPassword() metodu ile (User modelinde tanımlı)
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Geçersiz e-posta veya şifre');
    }
};

// @desc    Kullanıcı profilini getir
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
