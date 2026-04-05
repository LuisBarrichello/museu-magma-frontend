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
import CustomersPage from './pages/CustomersPage/CustomersPage';
import StockMovementsPage from './pages/StockMovementsPage/StockMovementsPage';
import ProfitabilityReportPage from './pages/Reports/ProfitabilityReportPage';
import CheckInPage from './pages/VisitorsPage/CheckInPage';
import CheckOutPage from './pages/VisitorsPage/CheckOutPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rotas públicas */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Rotas protegidas */}
                    <Route element={<MainLayout />}>

                        {/* Dashboard — todos os perfis */}
                        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SELLER', 'STOCKCLERK']} />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                        </Route>

                        {/* Vendas e Clientes — Admin e Vendedor */}
                        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SELLER']} />}>
                            <Route path="/sales" element={<SalesPage />} />
                            <Route path="/sales/new" element={<NewSalePage />} />
                            <Route path="/customers" element={<CustomersPage />} />
                        </Route>

                        {/* Relatórios e Usuários — apenas Admin */}
                        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
                            <Route path="/users" element={<UsersPage />} />
                            <Route path="/reports/profitability" element={<ProfitabilityReportPage />} />
                        </Route>

                        {/* Produtos e Estoque — Admin e Estoquista */}
                        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'STOCKCLERK']} />}>
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/stock-movements" element={<StockMovementsPage />} />
                        </Route>

                        {/* ✅ Visitantes — Admin e Vendedor */}
                        <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SELLER']} />}>
                            <Route path="/visitors/check-in" element={<CheckInPage />} />
                            <Route path="/visitors/check-out" element={<CheckOutPage />} />
                        </Route>

                    </Route>

                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;