import React, { useMemo, useState } from 'react';
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
    // Filtro de período — controla qual agrupamento mostrar
    const [periodo, setPeriodo] = useState('mes');

    // Busca dados reais de vendas e produtos (já funcionam)
    const { data: sales, loading: loadingSales, error: errorSales } = useApi('/sales');
    const { data: products, loading: loadingProducts, error: errorProducts } = useApi('/products');
    const { data: visits, loading: loadingVisits, error: errorVisits } = useApi('/visits/');

    // ─────────────────────────────────────────
    // GRÁFICOS EXISTENTES — Lucratividade
    // ─────────────────────────────────────────
    const chartData = useMemo(() => {
        if (!sales || !products) return null;

        const productCategoryMap = products.reduce((acc, product) => {
            acc[product.id] = product.category_display;
            return acc;
        }, {});

        const productCostMap = products.reduce((acc, product) => {
            acc[product.id] = parseFloat(product.cost_price);
            return acc;
        }, {});

        const profitByCategory = sales.reduce((acc, sale) => {
            let saleSubtotal = 0;
            for (const item of sale.items) {
                saleSubtotal += parseFloat(item.unit_price) * parseFloat(item.quantity);
            }
            const saleDiscount = parseFloat(sale.discount) || 0;
            for (const item of sale.items) {
                const category = productCategoryMap[item.product];
                const costPrice = productCostMap[item.product];
                if (category && costPrice !== undefined && saleSubtotal > 0) {
                    const itemValue = parseFloat(item.unit_price) * parseFloat(item.quantity);
                    const itemProfitBeforeDiscount = (parseFloat(item.unit_price) - costPrice) * parseFloat(item.quantity);
                    const itemProportion = itemValue / saleSubtotal;
                    const itemDiscountPortion = saleDiscount * itemProportion;
                    acc[category] = (acc[category] || 0) + (itemProfitBeforeDiscount - itemDiscountPortion);
                }
            }
            return acc;
        }, {});

        const profitByMonth = sales.reduce((acc, sale) => {
            const month = new Date(sale.sale_date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            const saleProfit = parseFloat(sale.total_amount) - parseFloat(sale.total_cost);
            acc[month] = (acc[month] || 0) + saleProfit;
            return acc;
        }, {});

        const sortedMonths = Object.keys(profitByMonth).sort(
            (a, b) => new Date('01 ' + a.replace("'", '')) - new Date('01 ' + b.replace("'", ''))
        );

        return {
            byCategory: {
                labels: Object.keys(profitByCategory),
                datasets: [{
                    label: 'Lucro por Categoria (R$)',
                    data: Object.values(profitByCategory),
                    backgroundColor: 'rgba(229, 122, 68, 0.6)',
                    borderColor: 'rgba(229, 122, 68, 1)',
                    borderWidth: 1,
                }],
            },
            byMonth: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Lucro por Mês (R$)',
                    data: sortedMonths.map((month) => profitByMonth[month]),
                    fill: false,
                    borderColor: 'rgba(244, 184, 96, 1)',
                    tension: 0.1,
                }],
            },
        };
    }, [sales, products]);

    // ─────────────────────────────────────────
    // NOVOS GRÁFICOS — Visitantes
    // ─────────────────────────────────────────
    const visitasData = useMemo(() => {
    if (!visits || visits.length === 0) return null;

    const grouped = visits.reduce((acc, visit) => {
        const date = new Date(visit.check_in_at);
        let label = '';

        if (periodo === 'dia') {
            label = date.toLocaleDateString('pt-BR');
        } else if (periodo === 'semana') {
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
            label = `Sem ${weekNum}/${date.getFullYear()}`;
        } else {
            label = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        }

        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(grouped);
    const valores = Object.values(grouped);

    return {
        labels,
        datasets: [{
            label: 'Número de Visitas',
            data: valores,
            fill: true,
            borderColor: 'rgba(99, 179, 237, 1)',
            backgroundColor: 'rgba(99, 179, 237, 0.15)',
            tension: 0.3,
            pointBackgroundColor: 'rgba(99, 179, 237, 1)',
        }],
    };
}, [visits, periodo]);

    // Calcula o tempo médio de visita em minutos
    const tempoMedio = useMemo(() => {
        if (!visits || visits.length === 0) return null;

        const totalMinutos = visits.reduce((acc, visit) => {
            const entrada = new Date(visit.check_in_at);
            const saida = new Date(visit.check_out_at);
            const minutos = (saida - entrada) / 60000; // converte ms pra minutos
            return acc + minutos;
        }, 0);

        const media = totalMinutos / visits.length;
        const horas = Math.floor(media / 60);
        const minutos = Math.round(media % 60);

        return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
    }, []);

    if (loadingSales || loadingProducts || loadingVisits) return <Spinner />;
    if (errorSales || errorProducts) return <div className="error-message">{errorSales || errorProducts}</div>;

    return (
        <div className="report-page">
            <header className="page-header">
                <h1>Relatórios</h1>
            </header>
            
            <section className="report-section">
                <h2 className="section-title">Lucratividade</h2>
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
            </section>

            
        </div>
    );
};

export default ProfitabilityReportPage;