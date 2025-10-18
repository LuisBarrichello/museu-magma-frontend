import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner/Spinner';
import DetailsModal from '../../components/common/DetailsModal/DetailsModal';
import './SalesPage.css';

const salesDetailsConfig = [
    { label: 'ID', key: 'id' },
    { label: 'Cliente', key: 'customer_name' },
    { label: 'Criado Por', key: 'created_by_name' },
    {
        label: 'Data da Venda',
        key: 'sale_date',
        format: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
    { label: 'Método de Pagamento', key: 'payment_method_display' },
    { label: 'Status', key: 'status_display' },
    { label: 'Desconto', key: 'discount' },
    { label: 'Valor Total', key: 'total_amount' },
    { label: 'Custo Total', key: 'total_cost' },
    { label: 'Notas', key: 'notes' },
];

const SalesPage = () => {
    const { data: sales, loading, error } = useApi('/sales/');
    const [modalState, setModalState] = useState({ type: null, data: null });

    const handleRowClick = (sale) => {
        setModalState({ type: 'details', data: sale });
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="sales-page">
            <header className="page-header">
                <h1>Histórico de Vendas</h1>
                <Link to="/sales/new" className="new-sale-btn">
                    + Nova Venda
                </Link>
            </header>

            <div className="list-container">
                {sales.map((sale) => (
                    <div
                        key={sale.id}
                        className="sale-card"
                        onClick={() => handleRowClick(sale)}
                    >
                        <div className="sale-row">
                            <div className="sale-field"><span>ID:</span> #{sale.id}</div>
                            <div className="sale-field"><span>Data:</span> {new Date(sale.sale_date).toLocaleDateString('pt-BR')}</div>
                            <div className="sale-field"><span>Cliente:</span> {sale.customer_name || 'N/A'}</div>
                        </div>
                        <div className="sale-row">
                            <div className="sale-field"><span>Total:</span> R$ {sale.total_amount}</div>
                            <div className="sale-field"><span>Status:</span> {sale.status_display}</div>
                            <div className="sale-field"><span>Vendedor:</span> {sale.created_by_name}</div>
                        </div>
                    </div>
                ))}
            </div>

            <DetailsModal
                isOpen={modalState.type === 'details'}
                onClose={() => setModalState({ type: null, data: null })}
                title="Detalhes da Venda"
                data={modalState.data}
                config={salesDetailsConfig}
            />
        </div>
    );
};

export default SalesPage;
