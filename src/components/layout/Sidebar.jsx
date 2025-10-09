import { NavLink } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';
import {
    FaTachometerAlt,
    FaUsers,
    FaShoppingCart,
    FaBoxOpen,
    FaHistory,
    FaChartLine,
    FaUserFriends,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const navLinks = {
        ADMIN: [
            {
                path: '/dashboard',
                label: 'Dashboard',
                icon: <FaTachometerAlt />,
            },
            { path: '/customers', label: 'Clientes', icon: <FaUserFriends /> },
            { path: '/sales', label: 'Vendas', icon: <FaShoppingCart /> },
            { path: '/products', label: 'Produtos', icon: <FaBoxOpen /> },
            {
                path: '/stock-movements',
                label: 'Histórico de Estoque',
                icon: <FaHistory />,
            },
            { path: '/users', label: 'Usuários', icon: <FaUsers /> },
            {
                path: '/reports/profitability',
                label: 'Relatórios',
                icon: <FaChartLine />,
            },
        ],
        SELLER: [
            {
                path: '/dashboard',
                label: 'Dashboard',
                icon: <FaTachometerAlt />,
            },
            { path: '/customers', label: 'Clientes', icon: <FaUserFriends /> },
            {
                path: '/sales',
                label: 'Minhas Vendas',
                icon: <FaShoppingCart />,
            },
            {
                path: '/products',
                label: 'Visualizar Produtos',
                icon: <FaBoxOpen />,
            },
        ],
        STOCKCLERK: [
            {
                path: '/dashboard',
                label: 'Dashboard',
                icon: <FaTachometerAlt />,
            },
            { path: '/products', label: 'Produtos', icon: <FaBoxOpen /> },
            {
                path: '/stock-movements',
                label: 'Histórico de Estoque',
                icon: <FaHistory />,
            },
        ],
    };

    const linksToShow = user ? navLinks[user.user_type] : [];

    return (
        <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div>
                    <img
                        src={logo}
                        alt="Museu Magma Logo"
                        className="sidebar-logo"
                    />
                    <button className="sidebar-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
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
                                }
                                onClick={onClose}>
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
