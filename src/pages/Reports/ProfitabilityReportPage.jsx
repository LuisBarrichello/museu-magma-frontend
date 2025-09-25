import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner/Spinner';
import './Reports.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
);

const ProfitabilityReportPage = () => {
    const {
        data: sales,
        loading: loadingSales,
        error: errorSales,
    } = useApi('/sales');
    const {
        data: products,
        loading: loadingProducts,
        error: errorProducts,
    } = useApi('/products');

    const chartData = useMemo(() => {
        if (!sales || !products) return null;

        const productCategoryMap = products.reduce((acc, product) => {
            acc[product.id] = product.category_display;
            return acc;
        }, {});

        const profitByCategory = sales.reduce((acc, sale) => {
            const saleProfit =
                parseFloat(sale.total_amount) - parseFloat(sale.total_cost);

            for (const item of sale.items) {
                const category = productCategoryMap[item.id];
                if (category) {
                    acc[category] = (acc[category] || 0) + saleProfit;
                }
            }

            return acc;
        }, {});

        const profitByMonth = sales.reduce((acc, sale) => {
            const month = new Date(sale.sale_date).toLocaleString('pt-BR', {
                month: 'short',
                year: '2-digit',
            });
            const saleProfit =
                parseFloat(sale.total_amount) - parseFloat(sale.total_cost);

            acc[month] = (acc[month] || 0) + saleProfit;
            return acc;
        }, {});

        const sortedMonths = Object.keys(profitByMonth).sort(
            (a, b) =>
                new Date('01 ' + a.replace("'", '')) -
                new Date('01 ' + b.replace("'", '')),
        );

        return {
            byCategory: {
                label: Object.keys(profitByCategory),
                datasets: [
                    {
                        label: 'Lucro por Categoria (R$)',
                        data: Object.values(profitByCategory),
                        backgroundColor: 'rgba(229, 122, 68, 0.6)',
                        borderColor: 'rgba(229, 122, 68, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            byMonth: {
                labels: sortedMonths,
                datasets: [
                    {
                        label: 'Lucro por Mês (R$)',
                        data: sortedMonths.map((month) => profitByMonth[month]),
                        fill: false,
                        borderColor: 'rgba(244, 184, 96, 1)',
                        tension: 0.1,
                    },
                ],
            },
        };
    }, [sales, products]);

    if (loadingSales || loadingProducts) return <Spinner />;
    if (errorSales || errorProducts)
        return (
            <div className="error-message">{errorSales || errorProducts}</div>
        );
    
    return (
        <div className="report-page">
            <header className="page-header">
                <h1>Relatório de Lucratividade</h1>
            </header>
            <div className="report-grid">
                <div className="chart-container">
                    <h3>Lucro por Categoria</h3>
                    {chartData && <Bar data={chartData.byCategory} />}
                </div>
                <div className="chart-container">
                    <h3>Lucro ao Longo do Tempo</h3>
                    {chartData && <Line data={chartData.byMonth} />}
                </div>
            </div>
        </div>
    );
};

export default ProfitabilityReportPage;
