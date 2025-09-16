import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './components/layout/MainLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import LoginPage from './pages/LoginPages/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import SalesPage from './pages/SalesPage/SalesPage';
import NewSalePage from './pages/SalesPage/NewSalePage/NewSalePage';
import UsersPage from './pages/UsersPage/UsersPage';
import UnauthorizedPage from './pages/UnauthorizedPage/UnauthorizedPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/unauthorized"
                        element={<UnauthorizedPage />}
                    />

                    {/* Protected Routes */}

                    <Route element={<MainLayout />}>
                        <Route
                            element={
                                <RoleProtectedRoute
                                    allowedRoles={[
                                        'ADMIN',
                                        'SELLER',
                                        'STOCKCLERK',
                                    ]}
                                />
                            }>
                            <Route
                                path="/dashboard"
                                element={<DashboardPage />}
                            />
                        </Route>
                        <Route
                            element={
                                <RoleProtectedRoute
                                    allowedRoles={[
                                        'ADMIN',
                                        'STOCKCLERK',
                                        'SELLER',
                                    ]}
                                />
                            }>
                            <Route
                                path="/products"
                                element={<ProductsPage />}
                            />
                        </Route>
                        <Route
                            element={
                                <RoleProtectedRoute
                                    allowedRoles={['ADMIN', 'SELLER']}
                                />
                            }>
                            <Route path="/sales" element={<SalesPage />} />
                            <Route path="/sales/new" element={<NewSalePage />} />
                        </Route>
                        <Route
                            element={
                                <RoleProtectedRoute allowedRoles={['ADMIN']} />
                            }>
                            <Route path="/users" element={<UsersPage />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
