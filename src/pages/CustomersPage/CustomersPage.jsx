import React, { useState, useMemo } from 'react';
import useApi from '../../hooks/useApi';
import apiClient from '../../services/api';
import Spinner from '../../components/common/Spinner/Spinner';
import CustomerModal from '../../components/CustomerModal/CustomerModal';
import DetailsModal from '../../components/common/DetailsModal/DetailsModal';
import './CustomersPage.css';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PaginationControls from '../../components/common/PaginationControls/PaginationControls';
import { FaPlus, FaEdit, FaTrash, } from 'react-icons/fa';

const customerDetailsConfig = [
    { label: 'ID', key: 'id' },
    { label: 'Nome', key: 'name' },
    { label: 'Documento', key: 'document' },
    { label: 'Tipo de Cliente', key: 'customer_type_display' },
    { label: 'Email', key: 'email' },
    { label: 'Telefone', key: 'phone' },
    { label: 'Notas', key: 'notes' },
    {
        label: 'Criado em',
        key: 'created_at',
        format: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
];

const CustomersPage = () => {
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
    const {
        data: customers,
        setData: setCustomers,
        count,
        loading,
        error,
    } = useApi('/customers/', apiParams);
    const [actionError, setActionError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const handleRowClick = (customer) => {
        setModalState({ type: 'details', data: customer });
    };

    const handleOpenCreateModal = () => {
        setModalState({ type: 'create', data: null });
    };

    const handleOpenEditModal = (customer) => {
        setModalState({ type: 'edit', data: customer });
    };

    const handleSaveCustomer = async (customerData, customerId) => {
        try {
            setActionError(null);
            if (customerId) {
                const response = await apiClient.patch(
                    `/customers/${customerId}/`,
                    customerData,
                );
                setCustomers(
                    customers.map((c) =>
                        c.id === customerId ? response.data : c,
                    ),
                );
                setModalState({ type: null, data: null });
            } else {
                const response = await apiClient.post(
                    '/customers/',
                    customerData,
                );
                setCustomers((prevCustomers) => [
                    response.data,
                    ...prevCustomers,
                ]);
                setModalState({ type: null, data: null });
            }
        } catch (error) {
            setActionError(
                error.message ||
                    'Não foi possível salvar o cliente. Verifique os dados.',
            );
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await apiClient.delete(`/customers/${customerId}/`);
                setCustomers(customers.filter((c) => c.id !== customerId));
            } catch (error) {
                setActionError(
                    error.message || 'Não foi possível excluir o cliente.',
                );
            }
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    const totalPages = Math.ceil(count / PAGE_SIZE);

    return (
        <div className="customers-page">
            <header className="page-header">
                <h1>Gerenciamento de Clientes</h1>
                <button onClick={handleOpenCreateModal} className="add-btn">
                    <FaPlus /> Adicionar Cliente
                </button>
            </header>

            <SearchBar
                onSearchChange={setSearchTerm}
                setCurrentPage={setCurrentPage}
            />

            {actionError && <div className="error-message">{actionError}</div>}
            <div className="list-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome / Razão Social</th>
                            <th>Documento</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr
                                key={customer.id}
                                onClick={() => handleRowClick(customer)}
                                className="clickable-row">
                                <td>{customer.name}</td>
                                <td>{customer.document}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td
                                    className="action-buttons"
                                    onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() =>
                                            handleOpenEditModal(customer)
                                        }
                                        className="edit-btn">
                                        <FaEdit />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteCustomer(customer.id)
                                        }
                                        className="delete-btn">
                                        <FaTrash />
                                        Excluir
                                    </button>
                                </td>
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
                item={"Clientes"}
            />

            <CustomerModal
                isOpen={
                    modalState.type === 'create' || modalState.type === 'edit'
                }
                onClose={() => setModalState({ type: null, data: null })}
                onSave={handleSaveCustomer}
                customerToEdit={
                    modalState.type === 'edit' ? modalState.data : null
                }
            />
            <DetailsModal
                isOpen={modalState.type === 'details'}
                onClose={() => setModalState({ type: null, data: null })}
                title="Detalhes do Cliente"
                data={modalState.data}
                config={customerDetailsConfig}
            />
        </div>
    );
};

export default CustomersPage;
