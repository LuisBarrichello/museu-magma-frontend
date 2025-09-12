import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    const isAuthorized =
        isAuthenticated && user && allowedRoles.includes(user.user_type);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
