import { NavLink } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

const Sidebar = () => {
    const { user } = useAuth();

    const navLinks = {
        ADMIN: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/sales', label: 'Vendas' },
            { path: '/products', label: 'Produtos' },
            { path: '/users', label: 'Usuários' },
        ],
        SELLER: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/sales', label: 'Minhas Vendas' },
        ],
        STOCKCLERK: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/products', label: 'Produtos' },
        ],
    };

    const linksToShow = user ? navLinks[user.user_type] : [];

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <img
                    src={logo}
                    alt="Museu Magma Logo"
                    className="sidebar-logo"
                />
                <h2>Museu Magma</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {linksToShow.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    isActive ? 'active' : ''
                                }>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
