import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Code2, User } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>DevVault</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/projects" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    <FolderKanban size={20} />
                    <span>Projeler</span>
                </NavLink>
                <NavLink to="/snippets" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    <Code2 size={20} />
                    <span>Komut Kasası</span>
                </NavLink>
                <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    <User size={20} />
                    <span>Profil</span>
                </NavLink>
            </nav>
        </aside>
    );
};
export default Sidebar;
