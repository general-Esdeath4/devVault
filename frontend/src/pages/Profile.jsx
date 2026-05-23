import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">Profilim</h2>
            </div>
            <div className="project-card" style={{maxWidth: '500px'}}>
                <div className="form-group">
                    <label>Kullanıcı Adı</label>
                    <input type="text" className="form-input" disabled value={user?.username || ''} />
                </div>
                <div className="form-group">
                    <label>E-posta</label>
                    <input type="email" className="form-input" disabled value={user?.email || ''} />
                </div>
                <button className="btn-primary mt-sm" style={{background: 'var(--danger-color)', width: 'auto'}} onClick={logout}>Güvenli Çıkış Yap</button>
            </div>
        </div>
    );
};
export default Profile;
