import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getVisits } from '../../services/visitsService';
import './VisitHistoryPage.css';

// Importação dos componentes globais padronizados
import Spinner from '../../components/common/Spinner/Spinner';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PaginationControls from '../../components/common/PaginationControls/PaginationControls';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

const ITEMS_PER_PAGE = 10;

const CHART_RANGE = {
    week: {
        key: 'week',
        days: 7,
        label: 'Semana',
        fetchLimit: 400,
        title: 'Visitas por dia',
    },
    month: {
        key: 'month',
        days: 30,
        label: 'Mês',
        fetchLimit: 800,
        title: 'Visitas por dia',
    },
    quarter: {
        key: 'quarter',
        days: 90,
        label: 'Últimos 3 meses',
        fetchLimit: 2000,
        title: 'Visitas por mês',
    },
};

function resolveVisitFields(visit) {
    const nested =
        visit.visitor && typeof visit.visitor === 'object'
            ? visit.visitor
            : null;
    const name = visit.visitor_name ?? nested?.name ?? visit.name ?? '—';
    const document =
        visit.visitor_document ?? nested?.document ?? visit.document ?? '—';
    const typeRaw = visit.visitor_type ?? nested?.visitor_type;
    const typeLabel =
        visit.visitor_type_display ??
        nested?.visitor_type_display ??
        typeRaw ??
        '—';

    const entry =
        visit.check_in_at ??
        visit.check_in ??
        visit.entry_at ??
        visit.started_at ??
        visit.entered_at ??
        visit.created_at;
    const exit =
        visit.check_out_at ??
        visit.check_out ??
        visit.exit_at ??
        visit.ended_at ??
        visit.left_at;

    let duration = visit.duration_display ?? visit.duration_formatted ?? null;
    if (duration == null && entry && exit)
        duration = formatDurationBetween(entry, exit);

    if (typeof duration === 'number') {
        const h = Math.floor(duration / 60);
        const m = duration % 60;
        duration = h > 0 ? `${h}h ${m}min` : `${m} min`;
    }

    return {
        name,
        document,
        typeRaw,
        typeLabel,
        entry,
        exit,
        duration: duration ?? '—',
    };
}

function formatDurationBetween(start, end) {
    const ms = new Date(end) - new Date(start);
    if (Number.isNaN(ms) || ms < 0) return '—';
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${h}h ${m}min`;
    if (m === 0) return '< 1 min';
    return `${m} min`;
}

function formatDateTime(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return String(value);
    }
}

function badgeClass(typeRaw) {
    const map = {
        INDIVIDUAL: 'type-badge badge-individual',
        GROUP: 'type-badge badge-group',
        SCHOOL: 'type-badge badge-school',
    };
    return map[typeRaw] || 'type-badge badge-default';
}

function dateToLocalDayKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function entryLocalDayKey(entry) {
    if (!entry) return null;
    const d = new Date(entry);
    if (Number.isNaN(d.getTime())) return null;
    return dateToLocalDayKey(d);
}

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}

function getRangeBounds(days) {
    const end = endOfDay(new Date());
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - (days - 1));
    return { start, end };
}

function visitEntryRaw(visit) {
    return resolveVisitFields(visit).entry ?? visit.created_at;
}

function visitInRange(entryStr, start, end) {
    if (!entryStr) return false;
    const t = new Date(entryStr).getTime();
    return t >= start.getTime() && t <= end.getTime();
}

function eachDayKeyInRange(start, end) {
    const keys = [];
    const cur = startOfDay(new Date(start));
    const last = startOfDay(new Date(end));
    while (cur.getTime() <= last.getTime()) {
        keys.push(dateToLocalDayKey(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return keys;
}

function eachMonthKeyBetween(start, end) {
    const keys = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endKey = end.getFullYear() * 12 + end.getMonth();
    while (cur.getFullYear() * 12 + cur.getMonth() <= endKey) {
        keys.push(
            `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`,
        );
        cur.setMonth(cur.getMonth() + 1);
    }
    return keys;
}

function formatMonthLabelFromKey(yymm) {
    const [y, m] = yymm.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
    });
}

function formatDayLabel(isoDay) {
    const [y, mo, da] = isoDay.split('-').map(Number);
    const d = new Date(y, mo - 1, da);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) =>
                    `${ctx.parsed.y} visita${ctx.parsed.y !== 1 ? 's' : ''}`,
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 0 },
        },
        y: { beginAtZero: true, ticks: { precision: 0 } },
    },
};

export default function VisitHistoryPage() {
    const [visits, setVisits] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [chartSample, setChartSample] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(null);
    const [chartRange, setChartRange] = useState('week');

    const fetchVisits = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getVisits({
                search,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setVisits(data.results ?? []);
            setTotalCount(data.count ?? 0);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    err.message ||
                    'Erro ao carregar visitas.',
            );
        } finally {
            setLoading(false);
        }
    }, [search, currentPage]);

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    useEffect(() => {
        let cancelled = false;
        const fetchLimit = CHART_RANGE[chartRange].fetchLimit;
        (async () => {
            setChartLoading(true);
            setChartError(null);
            try {
                const data = await getVisits({
                    search,
                    page: 1,
                    limit: fetchLimit,
                });
                if (!cancelled) setChartSample(data.results ?? []);
            } catch (e) {
                if (!cancelled) {
                    setChartError(
                        e.response?.data?.detail ||
                            e.message ||
                            'Gráfico indisponível.',
                    );
                    setChartSample([]);
                }
            } finally {
                if (!cancelled) setChartLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [search, chartRange]);

    const visitsByDayBarData = useMemo(() => {
        const cfg = CHART_RANGE[chartRange];
        const { start, end } = getRangeBounds(cfg.days);
        const filtered = chartSample.filter((v) =>
            visitInRange(visitEntryRaw(v), start, end),
        );

        if (chartRange === 'quarter') {
            const monthKeys = eachMonthKeyBetween(start, end);
            const counts = Object.fromEntries(monthKeys.map((k) => [k, 0]));
            for (const v of filtered) {
                const e = visitEntryRaw(v);
                if (!e) continue;
                const d = new Date(e);
                const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (Object.hasOwn(counts, mk)) counts[mk] += 1;
            }
            return {
                labels: monthKeys.map(formatMonthLabelFromKey),
                datasets: [
                    {
                        label: cfg.title,
                        data: monthKeys.map((k) => counts[k]),
                        backgroundColor: 'rgba(243, 111, 33, 0.55)', // Usando o laranja do seu tema (#f36f21)
                        borderColor: 'rgba(243, 111, 33, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            };
        }

        const dayKeys = eachDayKeyInRange(start, end);
        const counts = Object.fromEntries(dayKeys.map((k) => [k, 0]));
        for (const v of filtered) {
            const key = entryLocalDayKey(visitEntryRaw(v));
            if (key && Object.hasOwn(counts, key)) counts[key] += 1;
        }
        return {
            labels: dayKeys.map(formatDayLabel),
            datasets: [
                {
                    label: cfg.title,
                    data: dayKeys.map((k) => counts[k]),
                    backgroundColor: 'rgba(243, 111, 33, 0.55)', // Usando o laranja do seu tema (#f36f21)
                    borderColor: 'rgba(243, 111, 33, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [chartSample, chartRange]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const rows = useMemo(
        () => visits.map((v) => ({ id: v.id, ...resolveVisitFields(v) })),
        [visits],
    );

    if (loading && !visits.length) return <Spinner />;

    return (
        <div className="visit-history-page">
            <header className="page-header">
                <h1>Histórico de Visitas</h1>
                <p>
                    Registros de entrada e saída. Busque por nome ou documento
                    do visitante.
                </p>
            </header>

            <div className="visit-chart-card">
                <div className="visit-chart-head">
                    <h2 className="visit-chart-title">
                        {CHART_RANGE[chartRange].title}
                    </h2>
                    <div className="chart-range-toggle" role="group">
                        {['week', 'month', 'quarter'].map((key) => (
                            <button
                                key={key}
                                type="button"
                                className={
                                    chartRange === key ? 'is-active' : ''
                                }
                                onClick={() => setChartRange(key)}>
                                {CHART_RANGE[key].label}
                            </button>
                        ))}
                    </div>
                </div>

                {chartLoading ? (
                    <div className="visit-chart-loading">
                        <Spinner />
                    </div>
                ) : chartError ? (
                    <p className="visit-chart-error">{chartError}</p>
                ) : visitsByDayBarData.labels.length === 0 ? (
                    <p className="visit-chart-empty">
                        Sem dados de data de entrada para exibir no gráfico.
                    </p>
                ) : (
                    <div className="visit-chart-canvas-wrap">
                        <Bar
                            data={visitsByDayBarData}
                            options={barChartOptions}
                        />
                    </div>
                )}
            </div>

            {/* Barra de Pesquisa Padronizada */}
            <SearchBar
                onSearchChange={setSearch}
                setCurrentPage={setCurrentPage}
                placeholder={'Buscar por nome ou documento...'}
            />

            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    {/* Tabela Padronizada */}
                    <div className="list-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Documento</th>
                                    <th>Tipo</th>
                                    <th>Entrada</th>
                                    <th>Saída</th>
                                    <th>Duração</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            style={{ textAlign: 'center' }}>
                                            Nenhuma visita encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, index) => (
                                        <tr
                                            key={
                                                row.id ??
                                                `${row.entry}-${index}`
                                            }>
                                            <td>
                                                <div className="visitor-name">
                                                    {row.name}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="visitor-doc">
                                                    {row.document === '—' ? (
                                                        <span className="text-secondary">
                                                            —
                                                        </span>
                                                    ) : (
                                                        row.document
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={badgeClass(
                                                        row.typeRaw,
                                                    )}>
                                                    {row.typeLabel}
                                                </span>
                                            </td>
                                            <td className="text-secondary">
                                                {formatDateTime(row.entry)}
                                            </td>
                                            <td className="text-secondary">
                                                {formatDateTime(row.exit)}
                                            </td>
                                            <td>{row.duration}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação Padronizada */}
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        count={totalCount}
                        setCurrentPage={setCurrentPage}
                        item={'Visitas'}
                    />
                </>
            )}
        </div>
    );
}
