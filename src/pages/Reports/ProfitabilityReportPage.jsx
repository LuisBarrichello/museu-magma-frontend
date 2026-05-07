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
import useAnalyticsDashboard from '../../hooks/useAnalyticsDashboard';
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
    // Busca de Dados
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
    const {
        data: visits,
        loading: loadingVisits,
        error: errorVisits,
    } = useApi('/visits/');
    const {
        data: analytics,
        loading: loadingAnalytics,
        error: errorAnalytics,
        unavailable: analyticsUnavailable,
    } = useAnalyticsDashboard();

    const [visitPeriodFilter, setVisitPeriodFilter] = useState('day'); // 'day', 'week', 'month'

    // --------------------------------------------------------
    // LÓGICA DE VENDAS E PRODUTOS (Mesclada da V2)
    // --------------------------------------------------------
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

        const productNameMap = products.reduce((acc, product) => {
            acc[product.id] = product.name;
            return acc;
        }, {});

        // 1. Lucro por Categoria e Top Produtos
        const profitByCategory = {};
        const productAggregates = {};

        // 2. Lucro, Receita e Custo por Mês
        const profitByMonth = {};
        const revenueAndCostByMonth = {};

        sales.forEach((sale) => {
            // Processamento Mensal (V2 - Mais seguro com YYYY-MM)
            const saleDate = new Date(sale.sale_date);
            const year = saleDate.getFullYear();
            const monthNumber = String(saleDate.getMonth() + 1).padStart(
                2,
                '0',
            );
            const monthKey = `${year}-${monthNumber}`;

            const saleRevenue = parseFloat(sale.total_amount) || 0;
            const saleCost = parseFloat(sale.total_cost) || 0;
            const saleProfit = saleRevenue - saleCost;

            profitByMonth[monthKey] =
                (profitByMonth[monthKey] || 0) + saleProfit;

            if (!revenueAndCostByMonth[monthKey]) {
                revenueAndCostByMonth[monthKey] = { revenue: 0, cost: 0 };
            }
            revenueAndCostByMonth[monthKey].revenue += saleRevenue;
            revenueAndCostByMonth[monthKey].cost += saleCost;

            // Processamento de Itens (Descontos, Categorias, Ranking)
            let saleSubtotal = 0;
            for (const item of sale.items) {
                saleSubtotal +=
                    parseFloat(item.unit_price) * parseFloat(item.quantity);
            }
            const saleDiscount = parseFloat(sale.discount) || 0;

            for (const item of sale.items) {
                const productId = item.product;
                const category = productCategoryMap[productId];
                const costPrice = productCostMap[productId];
                const quantity = parseFloat(item.quantity) || 0;
                const unitPrice = parseFloat(item.unit_price) || 0;
                const itemValue = unitPrice * quantity;

                // Rateio de desconto
                const itemProportion =
                    saleSubtotal > 0 ? itemValue / saleSubtotal : 0;
                const itemDiscountPortion = saleDiscount * itemProportion;
                const itemRevenue = itemValue - itemDiscountPortion;

                // Lucro por Categoria
                if (category && costPrice !== undefined && saleSubtotal > 0) {
                    const itemProfitBeforeDiscount =
                        (unitPrice - costPrice) * quantity;
                    const itemProfitAfterDiscount =
                        itemProfitBeforeDiscount - itemDiscountPortion;
                    profitByCategory[category] =
                        (profitByCategory[category] || 0) +
                        itemProfitAfterDiscount;
                } else if (category && costPrice !== undefined) {
                    const itemProfitAfterDiscount = (0 - costPrice) * quantity;
                    profitByCategory[category] =
                        (profitByCategory[category] || 0) +
                        itemProfitAfterDiscount;
                }

                // Agregação para Top 10 Produtos
                const name =
                    item.product_name ||
                    productNameMap[productId] ||
                    `#${productId}`;
                if (!productAggregates[productId]) {
                    productAggregates[productId] = {
                        productId,
                        name,
                        quantity: 0,
                        revenue: 0,
                    };
                }
                productAggregates[productId].quantity += quantity;
                productAggregates[productId].revenue += itemRevenue;
            }
        });

        // Ordenação de Datas
        const sortedMonths = Object.keys(profitByMonth).sort();
        const monthLabels = sortedMonths.map((monthKey) => {
            const [year, month] = monthKey
                .split('-')
                .map((v) => parseInt(v, 10));
            return new Date(year, month - 1, 1).toLocaleString('pt-BR', {
                month: 'short',
                year: '2-digit',
            });
        });

        // Ordenação de Top 10
        const top10ByQuantity = Object.values(productAggregates)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        const top10ByRevenue = Object.values(productAggregates)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

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
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Lucro por Mês (R$)',
                        data: sortedMonths.map(
                            (monthKey) => profitByMonth[monthKey],
                        ),
                        fill: false,
                        borderColor: 'rgba(244, 184, 96, 1)',
                        tension: 0.1,
                    },
                ],
            },
            revenueVsCost: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Receita (R$)',
                        data: sortedMonths.map(
                            (monthKey) =>
                                revenueAndCostByMonth[monthKey].revenue,
                        ),
                        backgroundColor: 'rgba(76, 175, 80, 0.6)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Custo (R$)',
                        data: sortedMonths.map(
                            (monthKey) => revenueAndCostByMonth[monthKey].cost,
                        ),
                        backgroundColor: 'rgba(244, 67, 54, 0.6)',
                        borderColor: 'rgba(244, 67, 54, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            top10ByQuantity: {
                labels: top10ByQuantity.map((p) => p.name),
                datasets: [
                    {
                        label: 'Quantidade Vendida',
                        data: top10ByQuantity.map((p) => p.quantity),
                        backgroundColor: 'rgba(33, 150, 243, 0.6)',
                        borderColor: 'rgba(33, 150, 243, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            top10ByRevenue: {
                labels: top10ByRevenue.map((p) => p.name),
                datasets: [
                    {
                        label: 'Receita (R$)',
                        data: top10ByRevenue.map((p) => p.revenue),
                        backgroundColor: 'rgba(156, 39, 176, 0.6)',
                        borderColor: 'rgba(156, 39, 176, 1)',
                        borderWidth: 1,
                    },
                ],
            },
        };
    }, [sales, products]);

    const rankingOptions = useMemo(
        () => ({
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: true }, tooltip: { enabled: true } },
            scales: { x: { beginAtZero: true } },
        }),
        [],
    );

    // --------------------------------------------------------
    // LÓGICA DE VISITANTES (Mesclada V1 + V2)
    // --------------------------------------------------------

    // Dados de Visitas Gerais (V1 - APIs /visits)
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
                    return d.toLocaleString('pt-BR', {
                        month: 'short',
                        year: '2-digit',
                    });
                default:
                    return d.toLocaleDateString('pt-BR');
            }
        };

        const getWeekNumber = (date) => {
            const d = new Date(
                Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
            );
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        };

        const visitsByPeriod = visits.reduce((acc, visit) => {
            const key = formatDateKey(visit.check_in_at, visitPeriodFilter);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const completedVisits = visits.filter(
            (v) => v.check_out_at && v.check_in_at,
        );
        const totalDuration = completedVisits.reduce((sum, visit) => {
            return (
                sum +
                (new Date(visit.check_out_at) - new Date(visit.check_in_at))
            );
        }, 0);

        const avgDurationMinutes =
            completedVisits.length > 0
                ? Math.round(totalDuration / completedVisits.length / 60000)
                : 0;

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
                        data: sortedPeriods.map(
                            (period) => visitsByPeriod[period],
                        ),
                        backgroundColor: 'rgba(243, 111, 33, 0.6)',
                        borderColor: 'rgba(243, 111, 33, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            avgDurationMinutes,
            totalVisits: visits.length,
        };
    }, [visits, visitPeriodFilter]);

    // Dados do Analytics Dashboard (V2 - Gráficos de Pico)
    const analyticsChartData = useMemo(() => {
        if (!analytics) return null;

        const byHourRaw = analytics.visitors_by_hour ?? analytics.byHour;
        const byWeekdayRaw =
            analytics.visitors_by_weekday ?? analytics.byWeekday;

        const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}h`);
        const hourValues = Array.from({ length: 24 }, () => 0);

        if (Array.isArray(byHourRaw)) {
            if (
                byHourRaw.length === 24 &&
                byHourRaw.every((v) => typeof v === 'number')
            ) {
                for (let i = 0; i < 24; i++) hourValues[i] = byHourRaw[i] || 0;
            } else {
                for (const item of byHourRaw) {
                    const hour = parseInt(item?.hour ?? item?.h, 10);
                    const value =
                        parseFloat(
                            item?.count ?? item?.value ?? item?.visitors ?? 0,
                        ) || 0;
                    if (!Number.isNaN(hour) && hour >= 0 && hour <= 23)
                        hourValues[hour] = value;
                }
            }
        }

        const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weekdayValues = Array.from({ length: 7 }, () => 0);
        const weekdayIndexMap = {
            dom: 0,
            seg: 1,
            ter: 2,
            qua: 3,
            qui: 4,
            sex: 5,
            sab: 6,
            sáb: 6,
        };

        if (Array.isArray(byWeekdayRaw)) {
            if (
                byWeekdayRaw.length === 7 &&
                byWeekdayRaw.every((v) => typeof v === 'number')
            ) {
                for (let i = 0; i < 7; i++)
                    weekdayValues[i] = byWeekdayRaw[i] || 0;
            } else {
                for (const item of byWeekdayRaw) {
                    const key = String(item?.weekday ?? item?.day ?? '')
                        .toLowerCase()
                        .substring(0, 3);
                    const index = weekdayIndexMap[key];
                    const value =
                        parseFloat(
                            item?.count ?? item?.value ?? item?.visitors ?? 0,
                        ) || 0;
                    if (index !== undefined) weekdayValues[index] = value;
                }
            }
        }

        return {
            byHour: {
                labels: hourLabels,
                datasets: [
                    {
                        label: 'Pico de Visitantes por Hora',
                        data: hourValues,
                        fill: false,
                        borderColor: 'rgba(255, 152, 0, 1)',
                        tension: 0.1,
                    },
                ],
            },
            byWeekday: {
                labels: weekdayLabels,
                datasets: [
                    {
                        label: 'Pico de Visitantes por Dia',
                        data: weekdayValues,
                        backgroundColor: 'rgba(0, 188, 212, 0.6)',
                        borderColor: 'rgba(0, 188, 212, 1)',
                        borderWidth: 1,
                    },
                ],
            },
        };
    }, [analytics]);

    // Renderização e Tratamento de Erros de Carregamento
    if (loadingSales || loadingProducts || loadingVisits) return <Spinner />;
    if (errorSales || errorProducts || errorVisits)
        return (
            <div className="error-message">
                {errorSales || errorProducts || errorVisits}
            </div>
        );

    return (
        <div className="report-page">
            <header className="page-header">
                <h1>Painel de Relatórios</h1>
            </header>

            {/* SEÇÃO 1: Desempenho Financeiro */}
            <section className="report-section">
                <h2 className="section-title">Desempenho Financeiro</h2>
                <div className="report-grid">
                    <div className="chart-container">
                        <h3>Receita vs. Custo por Período</h3>
                        {chartData && <Bar data={chartData.revenueVsCost} />}
                    </div>
                    <div className="chart-container">
                        <h3>Lucro ao Longo do Tempo</h3>
                        {chartData && <Line data={chartData.byMonth} />}
                    </div>
                    <div className="chart-container">
                        <h3>Lucro por Categoria</h3>
                        {chartData && <Bar data={chartData.byCategory} />}
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: Ranking de Produtos */}
            <section className="report-section">
                <h2 className="section-title">Ranking de Produtos</h2>
                <div className="report-grid">
                    <div className="chart-container">
                        <h3>Top 10 Produtos (Quantidade)</h3>
                        {chartData && (
                            <Bar
                                data={chartData.top10ByQuantity}
                                options={rankingOptions}
                            />
                        )}
                    </div>
                    <div className="chart-container">
                        <h3>Top 10 Produtos (Receita)</h3>
                        {chartData && (
                            <Bar
                                data={chartData.top10ByRevenue}
                                options={rankingOptions}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* SEÇÃO 3: Análise de Visitantes */}
            <section className="report-section">
                <h2 className="section-title">Análise de Visitantes</h2>

                {/* KPIs mantidos da Versão 1 */}
                <div className="kpi-grid">
                    <KPICard
                        title="Tempo Médio de Visita"
                        value={visitorData?.avgDurationMinutes || 0}
                        unit="min"
                    />
                    <KPICard
                        title="Total de Visitas Registradas"
                        value={visitorData?.totalVisits || 0}
                    />
                </div>

                <div className="report-grid">
                    {/* Gráfico de Filtros da Versão 1 */}
                    <div className="chart-container visits-chart-container">
                        <div className="chart-header">
                            <h3>Histórico de Visitas</h3>
                            <div className="period-filter">
                                <button
                                    className={
                                        visitPeriodFilter === 'day'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={() => setVisitPeriodFilter('day')}>
                                    Dia
                                </button>
                                <button
                                    className={
                                        visitPeriodFilter === 'week'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={() =>
                                        setVisitPeriodFilter('week')
                                    }>
                                    Semana
                                </button>
                                <button
                                    className={
                                        visitPeriodFilter === 'month'
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={() =>
                                        setVisitPeriodFilter('month')
                                    }>
                                    Mês
                                </button>
                            </div>
                        </div>
                        {visitorData && <Bar data={visitorData.byPeriod} />}
                    </div>

                    {/* Gráficos Stacked de Analytics da Versão 2 */}
                    <div className="chart-container">
                        <h3>Métricas de Tráfego (Analytics)</h3>
                        {loadingAnalytics && <Spinner />}
                        {!loadingAnalytics && errorAnalytics && (
                            <div className="error-message">
                                {errorAnalytics}
                            </div>
                        )}
                        {!loadingAnalytics &&
                            !errorAnalytics &&
                            analyticsUnavailable && (
                                <div className="error-message">
                                    Endpoint de analytics não disponível.
                                </div>
                            )}
                        {!loadingAnalytics &&
                            !errorAnalytics &&
                            !analyticsUnavailable &&
                            analyticsChartData && (
                                <div className="stacked-charts">
                                    <Line data={analyticsChartData.byHour} />
                                    <Bar data={analyticsChartData.byWeekday} />
                                </div>
                            )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfitabilityReportPage;
