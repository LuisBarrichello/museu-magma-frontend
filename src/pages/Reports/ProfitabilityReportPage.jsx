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
import KPICard from '../../components/common/KPICard/KPICard';
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
    const {
        data: visits,
        loading: loadingVisits,
        error: errorVisits,
    } = useApi('/visits');

    const [visitPeriodFilter, setVisitPeriodFilter] = useState('day'); // 'day', 'week', 'month'

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
                saleSubtotal +=
                    parseFloat(item.unit_price) * parseFloat(item.quantity); // Use parseFloat aqui também
            }

            const saleDiscount = parseFloat(sale.discount) || 0;

            for (const item of sale.items) {
                const category = productCategoryMap[item.product];
                const costPrice = productCostMap[item.product];

                if (category && costPrice !== undefined && saleSubtotal > 0) {
                    const itemValue =
                        parseFloat(item.unit_price) * parseFloat(item.quantity);
                    const itemProfitBeforeDiscount =
                        (parseFloat(item.unit_price) - costPrice) *
                        parseFloat(item.quantity);
                    const itemProportion = itemValue / saleSubtotal;
                    const itemDiscountPortion = saleDiscount * itemProportion;
                    const itemProfitAfterDiscount =
                        itemProfitBeforeDiscount - itemDiscountPortion;
                    acc[category] =
                        (acc[category] || 0) + itemProfitAfterDiscount;
                } else if (category && costPrice !== undefined) {
                    const itemProfitAfterDiscount =
                        (0 - costPrice) * parseFloat(item.quantity);
                    acc[category] =
                        (acc[category] || 0) + itemProfitAfterDiscount;
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
                labels: Object.keys(profitByCategory),
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

    // Dados dos gráficos de visitantes
    const visitorData = useMemo(() => {
        if (!visits) return null;

        const formatDateKey = (date, period) => {
            const d = new Date(date);
            switch (period) {
                case 'day':
                    return d.toLocaleDateString('pt-BR');
                case 'week':
                    const weekStart = new Date(d);
                    weekStart.setDate(d.getDate() - d.getDay());
                    return `Sem ${getWeekNumber(d)}/${d.getFullYear()}`;
                case 'month':
                    return d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
                default:
                    return d.toLocaleDateString('pt-BR');
            }
        };

        const getWeekNumber = (date) => {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        };

        // Agrupar visitas por período
        const visitsByPeriod = visits.reduce((acc, visit) => {
            const key = formatDateKey(visit.check_in_at, visitPeriodFilter);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        // Calcular tempo médio de visita (apenas para visitas concluídas)
        const completedVisits = visits.filter(v => v.check_out_at && v.check_in_at);
        const totalDuration = completedVisits.reduce((sum, visit) => {
            const duration = new Date(visit.check_out_at) - new Date(visit.check_in_at);
            return sum + duration;
        }, 0);
        const avgDurationMinutes = completedVisits.length > 0
            ? Math.round(totalDuration / completedVisits.length / 60000)
            : 0;

        // Ordenar períodos
        const sortedPeriods = Object.keys(visitsByPeriod).sort((a, b) => {
            if (visitPeriodFilter === 'week') {
                const [weekA, yearA] = a.replace('Sem ', '').split('/');
                const [weekB, yearB] = b.replace('Sem ', '').split('/');
                return yearA - yearB || weekA - weekB;
            }
            return a.localeCompare(b, 'pt-BR');
        });

        return {
            byPeriod: {
                labels: sortedPeriods,
                datasets: [
                    {
                        label: `Visitas por ${visitPeriodFilter === 'day' ? 'Dia' : visitPeriodFilter === 'week' ? 'Semana' : 'Mês'}`,
                        data: sortedPeriods.map((period) => visitsByPeriod[period]),
                        backgroundColor: 'rgba(243, 111, 33, 0.6)',
                        borderColor: 'rgba(243, 111, 33, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            avgDurationMinutes,
            totalVisits: visits.length,
            completedVisits: completedVisits.length,
        };
    }, [visits, visitPeriodFilter]);

    if (loadingSales || loadingProducts || loadingVisits) return <Spinner />;
    if (errorSales || errorProducts || errorVisits)
        return (
            <div className="error-message">{errorSales || errorProducts || errorVisits}</div>
        );

    return (
        <div className="report-page">
            <header className="page-header">
                <h1>Relatório de Lucratividade</h1>
            </header>

            {/* Seção de Vendas */}
            <section className="report-section">
                <h2 className="section-title">Vendas</h2>
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

            {/* Seção de Visitantes */}
            <section className="report-section">
                <h2 className="section-title">Visitantes</h2>

                {/* KPIs de Visitantes */}
                <div className="kpi-grid">
                    <KPICard
                        title="Tempo Médio de Visita"
                        value={visitorData?.avgDurationMinutes || 0}
                        unit="min"
                    />
                    <KPICard
                        title="Total de Visitas"
                        value={visitorData?.totalVisits || 0}
                    />
                </div>

                {/* Gráfico de Visitas por Período */}
                <div className="chart-container visits-chart-container">
                    <div className="chart-header">
                        <h3>Visitas por Período</h3>
                        <div className="period-filter">
                            <button
                                className={visitPeriodFilter === 'day' ? 'active' : ''}
                                onClick={() => setVisitPeriodFilter('day')}
                            >
                                Dia
                            </button>
                            <button
                                className={visitPeriodFilter === 'week' ? 'active' : ''}
                                onClick={() => setVisitPeriodFilter('week')}
                            >
                                Semana
                            </button>
                            <button
                                className={visitPeriodFilter === 'month' ? 'active' : ''}
                                onClick={() => setVisitPeriodFilter('month')}
                            >
                                Mês
                            </button>
                        </div>
                    </div>
                    {visitorData && <Bar data={visitorData.byPeriod} />}
                </div>
            </section>
        </div>
    );
};

export default ProfitabilityReportPage;
