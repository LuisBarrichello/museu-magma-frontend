import React, { useState, useMemo } from 'react';
import Spinner from '../../components/common/Spinner/Spinner';
import './StockMovementsPage.css';
import useApi from '../../hooks/useApi';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PaginationControls from '../../components/common/PaginationControls/PaginationControls';

const StockMovementsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const endpoint = searchTerm
        ? `/stock-movements/?search=${searchTerm}`
        : '/stock-movements/';
    
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 5;

    const apiParams = useMemo(
            () => ({
                limit: PAGE_SIZE,
                offset: (currentPage - 1) * PAGE_SIZE,
                search: searchTerm,
            }),
            [currentPage, searchTerm],
    );
    const {
        data: movements,
        count,
        loading,
        error,
    } = useApi(endpoint, apiParams);

    const getMovementTypeClass = (type) => {
        switch (type) {
            case 'ENTRY':
                return 'type-entry';
            case 'SALE':
                return 'type-sale';
            case 'ADJUST':
                return 'type-adjust';
            default:
                return '';
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    const totalPages = Math.ceil(count / PAGE_SIZE);

    return (
        <div className="stock-movements-page">
            <header className="page-header">
                <h1>Histórico de Movimentações de Estoque</h1>
            </header>

            <SearchBar
                onSearchChange={setSearchTerm}
                setCurrentPage={setCurrentPage}
                placeholder={'Buscar por nome do produto, criador ou notas...'}
            />

            <div className="list-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>ID produto</th>
                            <th>Produto</th>
                            <th>Tipo</th>
                            <th>Quantidade</th>
                            <th>Custo Unit.</th>
                            <th>Usuário</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map((mov) => (
                            <tr key={mov.id}>
                                <td>
                                    {new Date(mov.timestamp).toLocaleString(
                                        'pt-BR',
                                    )}
                                </td>
                                <td>{mov.product}</td>
                                <td>{mov.product_name}</td>
                                <td>
                                    <span
                                        className={`type-badge ${getMovementTypeClass(
                                            mov.type,
                                        )}`}>
                                        {mov.type_display}
                                    </span>
                                </td>
                                <td>{mov.quantity}</td>
                                <td>R$ {mov.cost_price}</td>
                                <td>{mov.user_name}</td>
                                <td>{mov.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                count={count}
                setCurrentPage={setCurrentPage}
                item={'Movimentações'}
            />
        </div>
    );
};

export default StockMovementsPage;
