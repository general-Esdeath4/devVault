import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    User, Lock, History, LogOut, CheckCircle2, 
    PlusCircle, Edit2, Trash2, Key, Star, FileText, Settings,
    Eye, EyeOff
} from 'lucide-react';
import { API_URL } from '../config';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    
    // Profil Düzenleme State
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Şifre Değiştirme State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Aktivite Geçmişi State
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    const fetchActivities = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await axios.get(`${API_URL}/api/activities`, config);
            setActivities(data);
        } catch (error) {
            console.error('Aktiviteler yüklenemedi:', error);
        } finally {
            setLoadingActivities(false);
        }
    };

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setBio(user.bio || '');
            fetchActivities();
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_URL}/api/auth/profile`, { username, bio }, config);
            
            // Context güncelle
            updateUser(data);
            toast.success('Profil güncellendi!');
            fetchActivities(); // Aktiviteyi yeniden çek
        } catch (error) {
            toast.error(error.response?.data?.message || 'Profil güncellenemedi');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor!');
            return;
        }
        
        setUpdatingPassword(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/api/auth/password`, { oldPassword, newPassword }, config);
            
            toast.success('Şifre başarıyla güncellendi!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            fetchActivities(); // Aktiviteyi yeniden çek
        } catch (error) {
            toast.error(error.response?.data?.message || 'Şifre güncellenemedi');
        } finally {
            setUpdatingPassword(false);
        }
    };

    // Aktivite için İkon ve Renk seç
    const getActivityIcon = (action) => {
        const style = { size: 16 };
        switch (action) {
            case 'CREATE_PROJECT':
                return { icon: <PlusCircle {...style} color="#2ecc71" />, bg: 'rgba(46, 204, 113, 0.15)' };
            case 'UPDATE_PROJECT':
                return { icon: <Edit2 {...style} color="#3498db" />, bg: 'rgba(52, 152, 219, 0.15)' };
            case 'DELETE_PROJECT':
                return { icon: <Trash2 {...style} color="#e74c3c" />, bg: 'rgba(231, 76, 60, 0.15)' };
            case 'CREATE_SNIPPET':
                return { icon: <PlusCircle {...style} color="#9b59b6" />, bg: 'rgba(155, 89, 182, 0.15)' };
            case 'UPDATE_SNIPPET':
                return { icon: <Edit2 {...style} color="#f39c12" />, bg: 'rgba(243, 156, 18, 0.15)' };
            case 'DELETE_SNIPPET':
                return { icon: <Trash2 {...style} color="#e74c3c" />, bg: 'rgba(231, 76, 60, 0.15)' };
            case 'TOGGLE_FAVORITE':
                return { icon: <Star {...style} color="#f1c40f" />, bg: 'rgba(241, 196, 15, 0.15)' };
            case 'UPDATE_PROFILE':
                return { icon: <Settings {...style} color="#1abc9c" />, bg: 'rgba(26, 188, 156, 0.15)' };
            case 'CHANGE_PASSWORD':
                return { icon: <Key {...style} color="#e67e22" />, bg: 'rgba(230, 126, 34, 0.15)' };
            default:
                return { icon: <FileText {...style} color="#95a5a6" />, bg: 'rgba(149, 165, 166, 0.15)' };
        }
    };

    return (
        <div className="page-container profile-page">
            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <h2 className="page-title">Profilim</h2>
                <p className="page-subtitle" style={{ margin: 0 }}>Profilinizi yönetin, şifrenizi güncelleyin ve son aktivitelerinizi takip edin.</p>
            </div>

            <div className="profile-grid">
                {/* SOL KOLON - DÜZENLEME VE ŞİFRE */}
                <div className="profile-left-column">
                    {/* Profil Kartı */}
                    <div className="profile-card-section">
                        <div className="profile-card-header">
                            <User size={20} className="card-header-icon" />
                            <h3>Profil Bilgileri</h3>
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group">
                                <label>E-posta Adresi</label>
                                <input type="email" className="form-input" disabled value={user?.email || ''} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                <small style={{ display: 'block', marginTop: '0.25rem', opacity: 0.5 }}>E-posta adresiniz değiştirilemez.</small>
                            </div>
                            <div className="form-group">
                                <label>Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Biyografi / Hakkımda</label>
                                <textarea 
                                    className="form-input" 
                                    rows="4" 
                                    placeholder="Kendinizden bahsedin..." 
                                    value={bio} 
                                    onChange={e => setBio(e.target.value)}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-primary" disabled={updatingProfile} style={{ width: 'auto', display: 'block', marginLeft: 'auto' }}>
                                {updatingProfile ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </form>
                    </div>

                    {/* Şifre Kartı */}
                    <div className="profile-card-section">
                        <div className="profile-card-header">
                            <Lock size={20} className="card-header-icon" />
                            <h3>Şifre Değiştir</h3>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Mevcut Şifre</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showOldPassword ? "text" : "password"} 
                                        className="form-input" 
                                        required 
                                        placeholder="••••••••" 
                                        value={oldPassword} 
                                        onChange={e => setOldPassword(e.target.value)} 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        title={showOldPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Yeni Şifre</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showNewPassword ? "text" : "password"} 
                                        className="form-input" 
                                        required 
                                        placeholder="••••••••" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        title={showNewPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Yeni Şifre Onay</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        className="form-input" 
                                        required 
                                        placeholder="••••••••" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        title={showConfirmPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={updatingPassword} style={{ width: 'auto', display: 'block', marginLeft: 'auto' }}>
                                {updatingPassword ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle'}
                            </button>
                        </form>
                    </div>
                    
                    <button 
                        className="btn-outline flex-center gap-sm logout-profile-btn" 
                        style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', width: '100%', marginTop: '1rem', justifyContent: 'center' }} 
                        onClick={logout}
                    >
                        <LogOut size={18} /> Güvenli Çıkış Yap
                    </button>
                </div>

                {/* SAĞ KOLON - AKTİVİTE GEÇMİŞİ */}
                <div className="profile-right-column">
                    <div className="profile-card-section timeline-card">
                        <div className="profile-card-header">
                            <History size={20} className="card-header-icon" />
                            <h3>Aktivite Geçmişi</h3>
                        </div>
                        
                        {loadingActivities ? (
                            <div className="flex-center" style={{ padding: '3rem' }}>
                                <div className="spin-loader">Yükleniyor...</div>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="timeline">
                                {activities.map((act) => {
                                    const { icon, bg } = getActivityIcon(act.action);
                                    return (
                                        <div key={act._id} className="timeline-item">
                                            <div className="timeline-icon" style={{ backgroundColor: bg }}>
                                                {icon}
                                            </div>
                                            <div className="timeline-content">
                                                <p className="timeline-desc">{act.details}</p>
                                                <span className="timeline-time">
                                                    {new Date(act.createdAt).toLocaleString('tr-TR', { 
                                                        day: '2-digit', 
                                                        month: 'short', 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-timeline-state">
                                <CheckCircle2 size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                                <p>Henüz bir aktivite kaydı bulunmuyor.</p>
                                <small>Yaptığınız işlemler burada zaman sırasıyla görünecektir.</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
