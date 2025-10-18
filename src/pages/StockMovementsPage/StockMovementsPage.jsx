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
                {movements.map((mov) => (
                    <div key={mov.id} className="movement-card">
                        <div className="movement-row">
                            <div className="movement-field">
                                <span>Data:</span> {new Date(mov.timestamp).toLocaleString('pt-BR')}
                            </div>
                            <div className="movement-field">
                                <span>ID Produto:</span> {mov.product}
                            </div>
                            <div className="movement-field">
                                <span>Produto:</span> {mov.product_name}
                            </div>
                        </div>
                        <div className="movement-row">
                            <div className="movement-field">
                                <span>Tipo:</span>{' '}
                                <span className={`type-badge ${getMovementTypeClass(mov.type)}`}>
                                    {mov.type_display}
                                </span>
                            </div>
                            <div className="movement-field">
                                <span>Quantidade:</span> {mov.quantity}
                            </div>
                            <div className="movement-field">
                                <span>Custo Unit.:</span> R$ {mov.cost_price}
                            </div>
                        </div>
                        <div className="movement-row">
                            <div className="movement-field"><span>Usuário:</span> {mov.user_name}</div>
                            <div className="movement-field"><span>Observações:</span> {mov.notes}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockMovementsPage;
