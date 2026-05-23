import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { darkMode, toggleTheme } = useContext(ThemeContext);
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="navbar">
            <div className="navbar-search">
                {/* SearchBar buraya eklenecek */}
            </div>
            <div className="navbar-actions">
                <button className="theme-toggle" onClick={toggleTheme} title="Temayı Değiştir">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="user-profile">
                    <div className="avatar">{user?.username?.charAt(0).toUpperCase()}</div>
                    <span className="username">{user?.username}</span>
                    <button className="logout-btn" onClick={logout} title="Çıkış Yap">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
export default Navbar;
