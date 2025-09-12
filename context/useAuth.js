import { useContext } from 'react';
import { AuthProvider } from '../context/AuthContext';

export const useAuth = () => {
    return useContext(AuthProvider);
}