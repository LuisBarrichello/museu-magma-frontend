// =============================================
// ARQUIVO: src/pages/VisitorsPage/VisitHistoryPage.jsx
// =============================================
// Página de Histórico de Visitantes.
// Não precisa lidar com token diretamente — o apiClient já cuida
// disso automaticamente (igual a todas as outras páginas do projeto).

import { useState, useEffect, useCallback } from 'react';
import { getVisitors } from '../../services/visitorsService';
import './VisitHistoryPage.css';

// Quantos visitantes mostrar por página
const ITEMS_PER_PAGE = 10;

export default function VisitHistoryPage() {
    // ── Estado da página ─────────────────────────────────────
    const [visitors, setVisitors]       = useState([]);   // lista de visitantes
    const [totalCount, setTotalCount]   = useState(0);    // total de registros
    const [loading, setLoading]         = useState(true); // mostrando spinner?
    const [error, setError]             = useState(null); // mensagem de erro
    const [search, setSearch]           = useState('');   // texto da busca
    const [currentPage, setCurrentPage] = useState(1);   // página atual

    // ── Busca os visitantes na API ────────────────────────────
    // useCallback evita recriar esta função desnecessariamente
    const fetchVisitors = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // getVisitors usa o apiClient que já tem o token configurado
            const data = await getVisitors({
                search,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });

            setVisitors(data.results);  // array de visitantes
            setTotalCount(data.count);  // número total (para a paginação)
        } catch (err) {
            // Axios coloca a mensagem de erro em err.response?.data ou err.message
            const msg =
                err.response?.data?.detail ||
                err.message ||
                'Erro ao carregar visitantes.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [search, currentPage]);

    // Executa fetchVisitors sempre que a busca ou a página mudar
    useEffect(() => {
        fetchVisitors();
    }, [fetchVisitors]);

    // Ao digitar na busca, volta para a página 1
    function handleSearchChange(e) {
        setSearch(e.target.value);
        setCurrentPage(1);
    }

    // ── Cálculos de paginação ────────────────────────────────
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const firstItem  = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const lastItem   = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

    // ── Formata data "2026-03-31T16:54:03.697Z" → "31/03/2026" ─
    function formatDate(dateString) {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    }

    // ── Classe CSS do badge de tipo de visitante ─────────────
    function getBadgeClass(visitorType) {
        const map = {
            INDIVIDUAL: 'badge-type badge-individual',
            GROUP:      'badge-type badge-group',
            SCHOOL:     'badge-type badge-school',
        };
        return map[visitorType] || 'badge-type badge-default';
    }

    // ── Botões numerados de página ───────────────────────────
    function renderPageNumbers() {
        let start = Math.max(1, currentPage - 2);
        let end   = Math.min(totalPages, currentPage + 2);

        if (end - start < 4) {
            if (start === 1) end   = Math.min(5, totalPages);
            else             start = Math.max(1, end - 4);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((n) => (
            <button
                key={n}
                className={`btn-page ${n === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(n)}
            >
                {n}
            </button>
        ));
    }

    // ─────────────────────────────────────────────────────────
    // RENDERIZAÇÃO
    // ─────────────────────────────────────────────────────────
    return (
        <div className="visit-history-page">

            {/* Cabeçalho */}
            <div className="page-header">
                <h1>Histórico de Visitantes</h1>
                <p>Consulte e pesquise os visitantes cadastrados no sistema.</p>
            </div>

            {/* Barra de busca */}
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por nome ou documento..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Contagem de resultados */}
            {!loading && !error && (
                <p className="results-count">
                    {totalCount === 0
                        ? 'Nenhum visitante encontrado.'
                        : `${totalCount} visitante${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}.`}
                </p>
            )}

            {/* Card da tabela */}
            <div className="table-card">

                {/* Estado: carregando */}
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando visitantes...</p>
                    </div>
                )}

                {/* Estado: erro */}
                {!loading && error && (
                    <div className="error-state">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button className="btn-retry" onClick={fetchVisitors}>
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Estado: sem resultados */}
                {!loading && !error && visitors.length === 0 && (
                    <div className="empty-state">
                        <span>👥</span>
                        <p>
                            Nenhum visitante encontrado
                            {search ? ` para "${search}"` : ''}.
                        </p>
                    </div>
                )}

                {/* Tabela de visitantes */}
                {!loading && !error && visitors.length > 0 && (
                    <>
                        <table className="visitors-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nome</th>
                                    <th>Documento</th>
                                    <th>Tipo</th>
                                    <th className="col-email">E-mail</th>
                                    <th className="col-phone">Telefone</th>
                                    <th>Total de Visitas</th>
                                    <th>Cadastrado em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitors.map((visitor, index) => (
                                    <tr key={visitor.id}>
                                        <td className="text-secondary">
                                            {firstItem + index}
                                        </td>
                                        <td>
                                            <div className="visitor-name">
                                                {visitor.name}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="visitor-doc">
                                                {visitor.document || (
                                                    <span className="text-secondary">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={getBadgeClass(visitor.visitor_type)}>
                                                {visitor.visitor_type_display || visitor.visitor_type}
                                            </span>
                                        </td>
                                        <td className="col-email text-secondary">
                                            {visitor.email || '—'}
                                        </td>
                                        <td className="col-phone text-secondary">
                                            {visitor.phone || '—'}
                                        </td>
                                        <td>
                                            <strong>{visitor.total_visits ?? '—'}</strong>
                                        </td>
                                        <td className="text-secondary">
                                            {formatDate(visitor.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <span className="pagination-info">
                                    Mostrando {firstItem}–{lastItem} de {totalCount}
                                </span>
                                <div className="pagination-buttons">
                                    <button
                                        className="btn-page"
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ← Anterior
                                    </button>
                                    {renderPageNumbers()}
                                    <button
                                        className="btn-page"
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Próxima →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
