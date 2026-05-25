# DevVault - UML ve Tasarım Dokümantasyonu

Bu doküman, projenin UML diyagramlarını, veritabanı ilişkilerini (ERD) ve React bileşen mimarisini içermektedir. Diyagramlar, GitHub ve Markdown okuyucular tarafından otomatik olarak görselleştirilebilen **Mermaid** sözdizimi ile hazırlanmıştır.

---

## 1. Use-Case Diagram (Kullanım Senaryoları Diyagramı)

Sistemdeki geliştirici (kullanıcı) rolünün gerçekleştirebileceği temel işlevleri ve sistem sınırlarını gösterir.

```mermaid
graph TD
    User((Geliştirici / Kullanıcı))
    
    subgraph DevVault Sistemi
        UC_Auth(Giriş Yap / Kayıt Ol)
        UC_Dashboard(Dashboard ve İstatistikleri Görüntüle)
        UC_Proj_CRUD(Proje Ekle / Güncelle / Sil)
        UC_Snip_CRUD(Komut Ekle / Güncelle / Sil)
        UC_Snip_Fav(Komutları Favorile / Yıldızla)
        UC_Timeline(Aktivite Günlüğünü İncele)
        UC_Profile(Profil ve Biyografi Düzenle)
        UC_Password(Hesap Şifresini Değiştir)
    end
    
    User --> UC_Auth
    User --> UC_Dashboard
    User --> UC_Proj_CRUD
    User --> UC_Snip_CRUD
    User --> UC_Snip_Fav
    User --> UC_Timeline
    User --> UC_Profile
    User --> UC_Password
```

---

## 2. Activity Diagram (Aktivite Akış Diyagramı)

Sistemde en sık yapılan işlemlerden biri olan **"Komut Silme ve Onay/İptal Akışı"** aktivitesinin akış diyagramıdır.

```mermaid
stateDiagram-v2
    [*] --> Dashboard : Oturum Açık
    Dashboard --> SilmeButonu : "Sil" Butonuna Tıkla
    SilmeButonu --> OnayModal : ConfirmModal Arayüzü Açılır
    state OnayModal {
        [*] --> Karar
        Karar --> İptalEt : "İptal" Tıklanır
        Karar --> Onayla : "Sil" Tıklanır
    }
    İptalEt --> Dashboard : İşlem İptal Edilir & Modal Kapanır
    Onayla --> API_Request : DELETE /api/snippets/:id Gönderilir
    API_Request --> Backend_Validation : Token ve Sahiplik Doğrulaması
    Backend_Validation --> Delete_DB : Veritabanından Sil
    Delete_DB --> Log_Activity : Logger ile Aktivite Logla
    Log_Activity --> Toast_Success : Arayüze Başarı Mesajı Döner
    Toast_Success --> Dashboard : Liste Güncellenir
```

---

## 3. ER Diagram (Veritabanı Varlık-İlişki Diyagramı)

Mongoose üzerinde modellenen koleksiyonlar (`users`, `projects`, `snippets`, `activities`) ve aralarındaki `ObjectId` referans ilişkilerini gösterir.

```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ SNIPPET : "owns"
    USER ||--o{ ACTIVITY : "performs"
    PROJECT ||--o{ SNIPPET : "contains"
    
    USER {
        ObjectId id PK
        string username
        string email
        string password
        string bio
        date createdAt
        date updatedAt
    }
    
    PROJECT {
        ObjectId id PK
        string title
        string description
        string status
        string[] techStack
        string githubLink
        string liveLink
        ObjectId owner FK
        date createdAt
        date updatedAt
    }
    
    SNIPPET {
        ObjectId id PK
        string title
        string command
        string note
        string category
        boolean isFavorite
        string[] tags
        ObjectId owner FK
        ObjectId projectId FK
        date createdAt
        date updatedAt
    }
    
    ACTIVITY {
        ObjectId id PK
        ObjectId user FK
        string action
        string details
        date createdAt
    }
```

---

## 4. Component Relation Diagram (React Bileşen İlişkileri Diyagramı)

Ön yüzde kullanılan React Router yapısını, korumalı rotaları (Protected Routes), context'leri ve modalların bileşen hiyerarşisindeki yerleşimini gösterir.

```mermaid
graph TD
    App[App.jsx - Router] --> ProtectedRoute[ProtectedRoute.jsx]
    App --> Login[Login.jsx]
    
    ProtectedRoute --> Sidebar[Sidebar.jsx]
    ProtectedRoute --> MainContent[main-content div]
    
    MainContent --> Navbar[Navbar.jsx]
    MainContent --> Pages[Routes & Pages]
    
    Pages --> Dashboard[Dashboard.jsx]
    Pages --> Projects[Projects.jsx]
    Pages --> ProjectDetail[ProjectDetail.jsx]
    Pages --> SnippetManager[SnippetManager.jsx]
    Pages --> Profile[Profile.jsx]
    
    Projects --> ConfirmModal_Proj[ConfirmModal.jsx]
    ProjectDetail --> ConfirmModal_ProjDet[ConfirmModal.jsx]
    SnippetManager --> ConfirmModal_Snip[ConfirmModal.jsx]
    
    Navbar --> AuthContext[AuthContext.jsx]
    Navbar --> ThemeContext[ThemeContext.jsx]
    Profile --> AuthContext
```
