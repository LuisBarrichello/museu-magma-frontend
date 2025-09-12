import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../src/services/api';
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(() =>
        localStorage.getItem('accessToken')
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialUser = async () => {
            if (accessToken) {
                try {
                    const decodedToken = jwtDecode(accessToken);
                    const userId = decodedToken.user_id;
                    const response = await apiClient.get(`/users/${userId}/`);
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch initial user or token is invalid", error);
                    logout();
                }
            }
            setLoading(false);
        };
        
        fetchInitialUser();
    }, [accessToken]);

    const login = async (username, password) => {
        try {
            const response = await apiClient.post('/token/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            setAccessToken(access);
            navigate('/dashboard');

        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    }

    const authContextValue = {
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;