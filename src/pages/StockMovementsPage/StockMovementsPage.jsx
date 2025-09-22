import React, { useState } from 'react';
import Spinner from '../../components/common/Spinner/Spinner';
import './StockMovementsPage.css';
import useApi from '../../hooks/useApi';

const StockMovementsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const endpoint = activeSearch
        ? `/stock-movements/?search=${activeSearch}`
        : '/stock-movements/';

    const { data: movements, loading, error } = useApi(endpoint);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setActiveSearch(searchTerm);
    };

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

    return (
        <div className="stock-movements-page">
            <header className="page-header">
                <h1>Histórico de Movimentações de Estoque</h1>
            </header>

            <form className="search-bar" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Filtrar por nome do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Buscar</button>
            </form>

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
        </div>
    );
};

export default StockMovementsPage;
