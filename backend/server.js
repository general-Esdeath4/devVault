const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Route dosyaları
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const snippetRoutes = require('./routes/snippetRoutes');

dotenv.config();

// Veritabanına Bağlan
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Body-parser yerine geçer (req.body alabilmek için)
app.use(express.urlencoded({ extended: false }));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/snippets', snippetRoutes);

// Kök Dizin
app.get('/', (req, res) => {
    res.send('DevVault API Başarıyla Çalışıyor...');
});

// Hata Yönetimi Middleware'i
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu port ${PORT} üzerinde çalışıyor`);
});
