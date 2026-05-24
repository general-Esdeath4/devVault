const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/logger');

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

// @desc    Kullanıcı profilini güncelle
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const oldUsername = user.username;
        user.username = req.body.username || user.username;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

        const updatedUser = await user.save();

        // Aktiviteyi logla
        await logActivity(
            user._id,
            'UPDATE_PROFILE',
            `Profil bilgilerini güncelledi${oldUsername !== user.username ? ` (Yeni Kullanıcı Adı: ${user.username})` : ''}`
        );

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            bio: updatedUser.bio,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı');
    }
};

// @desc    Kullanıcı şifresini değiştir
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Mevcut şifre ve yeni şifre gereklidir');
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(oldPassword))) {
        user.password = newPassword;
        await user.save();

        // Aktiviteyi logla
        await logActivity(user._id, 'CHANGE_PASSWORD', 'Hesap şifresini güncelledi');

        res.status(200).json({ message: 'Şifre başarıyla güncellendi' });
    } else {
        res.status(401);
        throw new Error('Mevcut şifreniz yanlış');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
};
