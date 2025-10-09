import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner/Spinner';
import DetailsModal from '../../components/common/DetailsModal/DetailsModal';
import './SalesPage.css';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PaginationControls from '../../components/common/PaginationControls/PaginationControls';
import { FaPlus } from 'react-icons/fa';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const PAGE_SIZE = 15;
    const apiParams = useMemo(
        () => ({
            limit: PAGE_SIZE,
            offset: (currentPage - 1) * PAGE_SIZE,
            search: searchTerm,
        }),
        [currentPage, searchTerm],
    );
    const { data: sales, count, loading, error } = useApi('/sales/', apiParams);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const handleRowClick = (product) => {
        setModalState({ type: 'details', data: product });
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    const totalPages = Math.ceil(count / PAGE_SIZE);

    return (
        <div className="sales-page">
            <header className="page-header">
                <h1>Histórico de Vendas</h1>
                <Link to="/sales/new" className="new-sale-btn" >
                    <FaPlus /> Nova Venda
                </Link>
            </header>

            <SearchBar
                onSearchChange={setSearchTerm}
                setCurrentPage={setCurrentPage}
            />

            <div className="list-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID Venda</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Vendedor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr
                                key={sale.id}
                                onClick={() => handleRowClick(sale)}
                                className="clickable-row">
                                <td>#{sale.id}</td>
                                <td>
                                    {new Date(
                                        sale.sale_date,
                                    ).toLocaleDateString('pt-BR')}
                                </td>
                                <td>{sale.customer_name || 'N/A'}</td>
                                <td>R$ {sale.total_amount}</td>
                                <td>{sale.status_display}</td>
                                <td>{sale.created_by_name}</td>
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
                item={"Vendas"}
            />

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
