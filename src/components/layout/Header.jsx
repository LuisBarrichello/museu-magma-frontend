import { useAuth } from '../../hooks/useAuth';
import './Layout.css';

const Header = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <header className="app-header">
            <div className="header-content">
                <button className="hamburger-btn" onClick={onToggleSidebar}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                <div className="user-info">
                    {user && (
                        <span>Olá, {user.first_name || user.username}</span>
                    )}
                </div>
                <button onClick={logout} className="logout-button">
                    Sair
                </button>
            </div>
        </header>
    );
};

export default Header;
