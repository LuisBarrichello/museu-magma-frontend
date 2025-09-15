import { React, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css'; // Importa nosso novo CSS
import logo from '../../assets/img/logo.webp';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (error) {
            setError('Usuário ou senha inválidos. Tente novamente.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="login-page">
            <div className="login-container">
                <img src={logo} alt="Museu Magma Logo" className="login-logo" />
                <h1>Acessar o Sistema</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuário</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
