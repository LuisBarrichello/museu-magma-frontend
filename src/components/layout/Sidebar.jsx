import { NavLink } from 'react-router-dom';
import logo from '../../assets/img/logo.webp';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const navLinks = {
        ADMIN: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/customers', label: 'Clientes' },
            { path: '/sales', label: 'Vendas' },
            { path: '/products', label: 'Produtos' },
            { path: '/stock-movements', label: 'Histórico de Estoque' },
            { path: '/users', label: 'Usuários' },
            { path: '/reports/profitability', label: 'Relatório de Lucro' },
        ],
        SELLER: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/customers', label: 'Clientes' },
            { path: '/sales', label: 'Minhas Vendas' },
            { path: '/products', label: 'Visualizar Produtos' },
        ],
        STOCKCLERK: [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/products', label: 'Produtos' },
            { path: '/stock-movements', label: 'Histórico de Estoque' },
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
                            {/* Adiciona onClick para fechar o menu ao navegar */}
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    isActive ? 'active' : ''
                                }
                                onClick={onClose}>
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
