import { useCallback, useEffect, useState } from 'react';
import Spinner from '../../components/common/Spinner/Spinner';
import {
    listFixedCostEntries,
    createFixedCostEntry,
    updateFixedCostEntry,
    getFixedCostsSummary,
    deleteFixedCostEntry,
} from '../../services/fixedCostsService';
import { FIXED_COST_CATEGORIES, STATUS } from '../../constants/fixedCosts';
import './FixedCostsPage.css';
import { FaExclamationTriangle, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';

function moneyBr(value) {
    if (value == null || value === '') return '—';
    const n = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function normalizeStatus(s) {
    if (!s) return STATUS.PENDING;
    const t = String(s).toLowerCase();
    if (t === 'paid' || t === 'pago') return STATUS.PAID;
    return STATUS.PENDING;
}

function parseEntry(raw) {
    const dueDate =
        raw.due_date?.slice(0, 10) ??
        raw.reference_date?.slice(0, 10) ??
        raw.data_vencimento?.slice(0, 10) ??
        raw.data_referencia?.slice(0, 10);
    return {
        id: raw.id,
        category: raw.category ?? raw.categoria,
        description: (raw.description ?? raw.descricao ?? '').trim() || '—',
        amount: raw.value ?? raw.amount ?? raw.valor,
        dueDate: dueDate || null,
        paidAt:
            raw.paid_at?.slice(0, 10) ??
            raw.data_pagamento?.slice(0, 10) ??
            null,
        status: normalizeStatus(raw.status ?? raw.situacao),
        isOverdue: raw.is_overdue ?? false,
    };
}

function formatDisplayDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

function rowKey(row, index) {
    return row.id != null ? `id-${row.id}` : `row-${index}`;
}

const defaultMonth = () => new Date().toISOString().slice(0, 7);

function AddCostModal({ open, initialCategory, onClose, onSubmit, error }) {
    const [category, setCategory] = useState(initialCategory);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [formStatus, setFormStatus] = useState(STATUS.PENDING);

    useEffect(() => {
        if (open) {
            setCategory(initialCategory);
            setDescription('');
            setAmount('');
            setDueDate('');
            setFormStatus(STATUS.PENDING);
        }
    }, [open, initialCategory]);

    if (!open) return null;

    const handleForm = (e) => {
        e.preventDefault();
        const a = String(amount).replace(',', '.');
        if (!dueDate || a === '' || Number.isNaN(parseFloat(a))) return;
        onSubmit(
            {
                category,
                description: description.trim() || undefined,
                amount: a,
                due_date: dueDate,
                status: formStatus,
            },
            () => onClose(),
        );
    };

    return (
        <div
            className="fixed-cost-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-cost-title"
            onClick={onClose}
        >
            <div
                className="fixed-cost-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="fixed-cost-modal-head">
                    <h3 id="modal-add-cost-title">Adicionar custo</h3>
                    <button
                        type="button"
                        className="fixed-cost-modal-close"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleForm}>
                    <label>
                        Categoria
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            {FIXED_COST_CATEGORIES.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Descrição <span className="optional">(opcional)</span>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex.: Aluguel Abril"
                        />
                    </label>
                    <label>
                        Valor (R$)
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Data de vencimento
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Status
                        <select
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value)}
                        >
                            <option value={STATUS.PENDING}>Pendente</option>
                            <option value={STATUS.PAID}>Pago</option>
                        </select>
                    </label>
                    {error && (
                        <p className="fixed-cost-form-error" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="fixed-cost-modal-actions">
                        <button type="button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="primary">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CategoryTable({
    label,
    categoryId,
    entries,
    subtotal,
    onAddClick,
    onToggleStatus,
    onDeleteClick,
    busyId,
}) {
    return (
        <section
            className="fixed-cost-block"
            aria-labelledby={`heading-${categoryId}`}
        >
            <div className="fixed-cost-block-top">
                <h2
                    id={`heading-${categoryId}`}
                    className="fixed-cost-block-title"
                >
                    {label}
                </h2>
                <button
                    type="button"
                    className="fixed-cost-add-categ-btn"
                    onClick={() => onAddClick(categoryId)}
                >
                    <FaPlus /> Adicionar custo
                </button>
            </div>

            {entries.length > 0 && (
                <p className="fixed-cost-subtotal">
                    Subtotal da categoria:{' '}
                    <strong>{moneyBr(subtotal)}</strong>
                </p>
            )}

            {entries.length === 0 ? (
                <p className="fixed-cost-empty">Nenhum registo nesta categoria.</p>
            ) : (
                <div className="fixed-cost-table-wrap">
                    <table className="fixed-cost-table">
                        <thead>
                            <tr>
                                {categoryId === 'all' && <th>Categoria</th>}
                                <th>Descrição</th>
                                <th>Valor</th>
                                <th>Data (venc.)</th>
                                <th>Data pagamento</th>
                                <th>Status</th>
                                <th className="col-actions">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((row, index) => {
                                const overdue = row.isOverdue;
                                const categoryLabel = categoryId === 'all' ? (FIXED_COST_CATEGORIES.find(c => c.id === row.category)?.label || row.category) : null;
                                return (
                                    <tr
                                        key={rowKey(row, index)}
                                        className={[
                                            row.status === STATUS.PAID
                                                ? 'is-paid'
                                                : 'is-pending',
                                            overdue ? 'is-overdue' : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                    >
                                        {categoryId === 'all' && (
                                            <td><strong>{categoryLabel}</strong></td>
                                        )}
                                        <td
                                            className="cell-desc"
                                            title={row.description}
                                        >
                                            {row.description}
                                        </td>
                                        <td className="cell-amount">
                                            {moneyBr(row.amount)}
                                        </td>
                                        <td>{formatDisplayDate(row.dueDate)}</td>
                                        <td>
                                            {row.status === STATUS.PAID
                                                ? formatDisplayDate(row.paidAt)
                                                : '—'}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-pill ${
                                                    row.status === STATUS.PAID
                                                        ? 'paid'
                                                        : 'pending'
                                                }`}
                                            >
                                                {row.status === STATUS.PAID
                                                    ? '🟢 Pago'
                                                    : overdue
                                                      ? '🟡 Vencido'
                                                      : '🔴 Pendente'}
                                            </span>
                                            {overdue && (
                                                <span
                                                    className="overdue-hint"
                                                    title="Vencido e ainda em aberto"
                                                >
                                                    <FaExclamationTriangle />
                                                </span>
                                            )}
                                        </td>
                                        <td className="col-actions">
                                            <button
                                                type="button"
                                                className="fixed-cost-toggle sm"
                                                disabled={busyId === row.id}
                                                onClick={() =>
                                                    onToggleStatus(row)
                                                }
                                            >
                                                {row.status === STATUS.PAID
                                                    ? 'Pendente'
                                                    : 'Pago'}
                                            </button>
                                            <button
                                                type="button"
                                                className="fixed-cost-toggle sm fixed-cost-delete"
                                                disabled={busyId === row.id}
                                                onClick={() => onDeleteClick(row)}
                                                title="Apagar custo"
                                                style={{ marginLeft: '0.5rem', color: '#f87171' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default function FixedCostsPage() {
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ total_pending: 0, total_paid: 0, total_overall: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [filterMonth, setFilterMonth] = useState(() => defaultMonth());
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [addModal, setAddModal] = useState({ open: false, category: 'RENT' });

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (filterMonth) params.month = filterMonth;
            if (filterStatus !== 'all') params.status = filterStatus === 'pending' ? 'PENDING' : 'PAID';

            const [data, summaryData] = await Promise.all([
                listFixedCostEntries(params),
                getFixedCostsSummary(params)
            ]);
            const list = data.results ?? data;
            setRows((Array.isArray(list) ? list : []).map(parseEntry));
            setSummary({
                total_pending: summaryData.total_pending ?? 0,
                total_paid: summaryData.total_paid ?? 0,
                total_overall: summaryData.total_overall ?? 0,
            });
        } catch (e) {
            const errorData = e.response?.data;
            const detailedMsg = errorData 
                ? (errorData.detail || JSON.stringify(errorData))
                : e.message;
            setError(
                typeof detailedMsg === 'string' ? detailedMsg : 'Erro 400 - Parâmetros inválidos.',
            );
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, filterMonth, filterStatus]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAdd = async (payload, onSuccess) => {
        const key = payload.category;
        setActionError(null);
        setFormErrors((f) => ({ ...f, [key]: null }));
        const body = {
            category: key,
            value: payload.amount,
            due_date: payload.due_date,
            status: payload.status.toUpperCase(),
        };
        if (payload.description) {
            body.description = payload.description;
        }
        if (payload.status === STATUS.PAID) {
            body.paid_at = new Date().toISOString().slice(0, 10);
        }
        try {
            await createFixedCostEntry(body);
            load();
            onSuccess();
        } catch (e) {
            const msg =
                e.response?.data?.detail ||
                (typeof e.response?.data === 'object'
                    ? JSON.stringify(e.response.data)
                    : e.message) ||
                'Erro ao guardar.';
            setFormErrors((f) => ({ ...f, [key]: msg }));
            setActionError(msg);
        }
    };

    const handleModalSubmit = (payload, onSuccess) => {
        handleAdd(payload, onSuccess);
    };

    const handleToggleStatus = async (row) => {
        setActionError(null);
        setBusyId(row.id);
        const next =
            row.status === STATUS.PAID ? STATUS.PENDING : STATUS.PAID;
        const body = { status: next.toUpperCase() };
        if (next === STATUS.PAID) {
            body.paid_at = new Date().toISOString().slice(0, 10);
        } else {
            body.paid_at = null;
        }
        try {
            await updateFixedCostEntry(row.id, body);
            load();
        } catch (e) {
            setActionError(
                e.response?.data?.detail ||
                    e.message ||
                    'Não foi possível atualizar o estado.',
            );
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Tem a certeza que deseja apagar "${row.description}"?`)) return;
        setActionError(null);
        setBusyId(row.id);
        try {
            await deleteFixedCostEntry(row.id);
            load();
        } catch (e) {
            setActionError(
                e.response?.data?.detail ||
                    e.message ||
                    'Não foi possível apagar o custo.',
            );
        } finally {
            setBusyId(null);
        }
    };

    if (loading) return <Spinner />;

    const modalErr =
        addModal.open && formErrors[addModal.category]
            ? formErrors[addModal.category]
            : null;

    const activeCategory =
        selectedCategory === 'all'
            ? { id: 'all', label: 'Todas as Categorias' }
            : FIXED_COST_CATEGORIES.find((c) => c.id === selectedCategory) ??
              FIXED_COST_CATEGORIES[0];

    return (
        <div className="fixed-costs-page">
            <header className="page-header">
                <h1>Custos fixos</h1>
                <p>
                    Descrição (opcional), valor, vencimento e status.{' '}
                    <strong className="txt-pend">Pendente</strong> a vermelho,{' '}
                    <strong className="txt-paid">Pago</strong> a verde. Vencido em
                    aberto fica em destaque.
                </p>
            </header>

            {error && (
                <div className="fixed-costs-banner error">
                    {error} Se o endpoint ainda não existir no backend, implemente
                    <code> GET/POST/PATCH /api/v1/fixed-cost-entries/ </code> ou
                    ajuste <code>src/services/fixedCostsService.js</code>.
                </div>
            )}
            {actionError && !error && (
                <div className="fixed-costs-banner error">{actionError}</div>
            )}

            <div className="fixed-costs-filters" role="search">
                <label className="filter-field filter-field-category">
                    Categoria
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        aria-label="Categoria de custo fixo"
                    >
                        <option value="all">Todas as Categorias</option>
                        {FIXED_COST_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="filter-field">
                    Mês
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    />
                </label>
                <label className="filter-field">
                    Status
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                    </select>
                </label>
                <div className="filter-actions">
                    <button
                        type="button"
                        className="filter-btn"
                        onClick={() => {
                            setFilterMonth(defaultMonth());
                        }}
                    >
                        Mês atual
                    </button>
                    <button
                        type="button"
                        className="filter-btn"
                        onClick={() => {
                            setFilterMonth('');
                            setFilterStatus('all');
                        }}
                    >
                        Mostrar tudo
                    </button>
                </div>
            </div>

            <div className="fixed-costs-kpis" aria-label="Totais">
                <div className="kpi kpi-pend">
                    <span className="kpi-label">Total pendente</span>
                    <span className="kpi-value">{moneyBr(summary.total_pending)}</span>
                </div>
                <div className="kpi kpi-paid">
                    <span className="kpi-label">Total pago</span>
                    <span className="kpi-value">{moneyBr(summary.total_paid)}</span>
                </div>
                <div className="kpi kpi-total">
                    <span className="kpi-label">Total geral (filtro)</span>
                    <span className="kpi-value">
                        {moneyBr(summary.total_overall)}
                    </span>
                </div>
            </div>

            <div className="fixed-costs-grid">
                <CategoryTable
                    key={activeCategory.id}
                    label={activeCategory.label}
                    categoryId={activeCategory.id}
                    entries={rows}
                    subtotal={summary.total_overall}
                    onAddClick={(id) =>
                        setAddModal({ open: true, category: id })
                    }
                    onToggleStatus={handleToggleStatus}
                    onDeleteClick={handleDelete}
                    busyId={busyId}
                />
            </div>

            <AddCostModal
                open={addModal.open}
                initialCategory={addModal.category}
                onClose={() => setAddModal((m) => ({ ...m, open: false }))}
                onSubmit={handleModalSubmit}
                error={modalErr}
            />
        </div>
    );
}
