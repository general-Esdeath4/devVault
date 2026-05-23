import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { login, register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        if (isLogin) {
            success = await login(formData.email, formData.password);
        } else {
            success = await register(formData.username, formData.email, formData.password);
        }
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>DevVault</h2>
                    <p>{isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>Kullanıcı Adı</label>
                            <input type="text" name="username" className="form-input" value={formData.username} onChange={handleChange} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label>E-posta</label>
                        <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>
                        {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
                        <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;
