import React, { useMemo } from 'react';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner/Spinner';
import KPICard from '../../components/common/KPICard/KPICard';
import './DashboardPage.css';

const DashboardPage = () => {
    const {
        data: sales,
        loading: loadingSales,
        error: errorSales,
    } = useApi('/sales/');
    const {
        data: products,
        loading: loadingProducts,
        error: errorProducts,
    } = useApi('/products/');

    const kpis = useMemo(() => {
        if (!sales || !products) return null;

        const totalRevenue = sales.reduce(
            (acc, sale) => acc + parseFloat(sale.total_amount),
            0,
        );

        const numberOfSales = sales.length;

        const lowStockProducts = products.filter(
            (product) =>
                parseFloat(product.quantity) <=
                parseFloat(product.minimum_quantity),
        ).length;

        return {
            totalRevenue,
            numberOfSales,
            lowStockProducts,
        };
    }, [sales, products]); 
    
    if (loadingSales || loadingProducts) {
        return <Spinner />;
    }
    
    if (errorSales || errorProducts) {
        return (
            <div className="error-message">{errorSales || errorProducts}</div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Dashboard</h1>
            </header>

            <div className="dashboard-grid">
                <KPICard
                    title="Faturamento Total"
                    value={kpis.totalRevenue.toFixed(2)}
                    unit="R$"
                />
                <KPICard title="Número de Vendas" value={kpis.numberOfSales} />
                <KPICard
                    title="Produtos com Baixo Estoque"
                    value={kpis.lowStockProducts}
                />
            </div>
        </div>
    );
};

export default DashboardPage;
