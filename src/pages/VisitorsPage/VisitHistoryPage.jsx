import React, { useState, useEffect, useCallback } from 'react';
import { getVisitors } from '../../services/visitorsService';
import './VisitHistoryPage.css';
import Spinner from '../../components/common/Spinner/Spinner';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PaginationControls from '../../components/common/PaginationControls/PaginationControls';

const ITEMS_PER_PAGE = 10;

export default function VisitHistoryPage() {
    const [visitors, setVisitors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchVisitors = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getVisitors({
                search,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });

            setVisitors(data.results);
            setTotalCount(data.count);
        } catch (err) {
            const msg =
                err.response?.data?.detail ||
                err.message ||
                'Erro ao carregar visitantes.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [search, currentPage]);

    useEffect(() => {
        fetchVisitors();
    }, [fetchVisitors]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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

    function getBadgeClass(visitorType) {
        switch (visitorType) {
            case 'INDIVIDUAL':
                return 'badge-individual';
            case 'GROUP':
                return 'badge-group';
            case 'SCHOOL':
                return 'badge-school';
            default:
                return '';
        }
    }

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="visit-history-page">
            <header className="page-header">
                <h1>Histórico de Visitantes</h1>
            </header>

            <SearchBar
                onSearchChange={setSearch}
                setCurrentPage={setCurrentPage}
                placeholder={'Buscar por nome ou documento...'}
            />

            <div className="list-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Total de Visitas</th>
                            <th>Cadastrado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitors.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    Nenhum visitante encontrado.
                                </td>
                            </tr>
                        ) : (
                            visitors.map((visitor) => (
                                <tr key={visitor.id}>
                                    <td>
                                        <div>{visitor.name}</div>
                                        <div className="visitor-doc">
                                            {visitor.document || '—'}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge-type ${getBadgeClass(
                                                visitor.visitor_type,
                                            )}`}>
                                            {visitor.visitor_type_display ||
                                                visitor.visitor_type}
                                        </span>
                                    </td>
                                    <td>{visitor.email || '—'}</td>
                                    <td>{visitor.phone || '—'}</td>
                                    <td>{visitor.total_visits ?? '—'}</td>
                                    <td>{formatDate(visitor.created_at)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                count={totalCount}
                setCurrentPage={setCurrentPage}
                item={'Visitantes'}
            />
        </div>
    );
}
