# DevVault - Geliştirici Ortamı ve Komut Kasası

Bu proje, yazılımcıların sürekli kullandıkları terminal komutlarını, docker ayarlarını, veritabanı stringlerini ve önemli geliştirici notlarını projelerine özgü şekilde saklayabildikleri modern bir "Komut Kasası"dır.

## 🚀 Kullanılan Teknolojiler

### Backend (Sunucu)
- **Node.js & Express.js**: RESTful API mimarisi
- **MongoDB & Mongoose**: Veritabanı ve modeller
- **Bcrypt & JWT**: Kullanıcı yetkilendirmesi (Authentication)
- **Dotenv, Cors**

### Frontend (İstemci)
- **React.js & Vite**: Modern web mimarisi
- **React Router**: Sayfa yönlendirmeleri
- **Context API**: Global state ve oturum yönetimi
- **Axios**: HTTP istekleri
- **React Toastify**: Kullanıcı bildirimleri
- **Lucide React**: Modern ikon seti
- **Vanilla CSS**: Özelleştirilmiş, esnek stil ve Dark Mode (Karanlık Mod) desteği

## 📂 Proje Klasör Yapısı (MVC Mimarisine Uygun)
```
/web proje
├── /backend
│   ├── /config       (Veritabanı bağlantısı)
│   ├── /controllers  (İş mantığı ve API cevapları)
│   ├── /middlewares  (Auth ve Hata yönetimi)
│   ├── /models       (Mongoose Şemaları: User, Project, Snippet)
│   ├── /routes       (API rotaları)
│   ├── server.js     (Ana sunucu dosyası)
│   └── .env          (Çevresel değişkenler)
├── /frontend
│   ├── /src
│   │   ├── /components (Navbar, Sidebar, Modals, vb.)
│   │   ├── /context    (Auth ve Tema context'leri)
│   │   ├── /pages      (Login, Dashboard, ProjectDetail vb.)
│   │   ├── App.jsx     (Ana React bileşeni ve Router)
│   │   └── index.css   (Global stiller)
└── README.md
```

## ⚙️ Kurulum ve Çalıştırma

1. **MongoDB'nin çalıştığından emin olun.**
2. Backend (Sunucu) için bir terminal açın ve çalıştırın:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Frontend (Arayüz) için başka bir terminal açın ve çalıştırın:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Tarayıcınızda açılan `http://localhost:5173` adresinden uygulamaya erişin. (İlk başta kayıt olmanız gerekmektedir).

## 🌟 Öne Çıkan Özellikler
- **Dark/Light Mode:** Tüm sayfalar kusursuz karanlık mod uyumluluğuna sahiptir.
- **Güvenlik:** Korumalı rotalar (Protected Routes) ile sisteme giriş yapmadan sayfalara erişim kısıtlanmıştır.
- **Etkileşim:** Toast mesajları ve Loading spinner'ları ile yüksek kullanıcı deneyimi sunar.
- **Kopyalama Desteği:** Kaydedilen komutlar tek tuşla panoya kopyalanabilir.

> *Not: Bu proje, MERN Stack kullanılarak hazırlanmış bir dönem projesi teslimatıdır.*
