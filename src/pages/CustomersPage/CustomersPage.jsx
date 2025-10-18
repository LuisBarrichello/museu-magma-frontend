import React, { useState } from 'react';
import useApi from '../../hooks/useApi';
import apiClient from '../../services/api';
import Spinner from '../../components/common/Spinner/Spinner';
import CustomerModal from '../../components/CustomerModal/CustomerModal';
import DetailsModal from '../../components/common/DetailsModal/DetailsModal';
import './CustomersPage.css';

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
    const { data: customers, setData: setCustomers, loading, error } = useApi('/customers/');
    const [actionError, setActionError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const handleRowClick = (customer) => setModalState({ type: 'details', data: customer });
    const handleOpenCreateModal = () => setModalState({ type: 'create', data: null });
    const handleOpenEditModal = (customer) => setModalState({ type: 'edit', data: customer });

    const handleSaveCustomer = async (customerData, customerId) => {
        try {
            setActionError(null);
            if (customerId) {
                const response = await apiClient.patch(`/customers/${customerId}/`, customerData);
                setCustomers(customers.map(c => c.id === customerId ? response.data : c));
            } else {
                const response = await apiClient.post('/customers/', customerData);
                setCustomers(prev => [response.data, ...prev]);
            }
            setModalState({ type: null, data: null });
        } catch (err) {
            setActionError(err.message || 'Não foi possível salvar o cliente. Verifique os dados.');
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await apiClient.delete(`/customers/${customerId}/`);
                setCustomers(customers.filter(c => c.id !== customerId));
            } catch (err) {
                setActionError(err.message || 'Não foi possível excluir o cliente.');
            }
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="customers-page">
            <header className="page-header">
                <h1>Gerenciamento de Clientes</h1>
                <button onClick={handleOpenCreateModal} className="add-btn">+ Adicionar Cliente</button>
            </header>

            {actionError && <div className="error-message">{actionError}</div>}

            <div className="list-container">
                {customers.map(customer => (
                    <div key={customer.id} className="customer-card" onClick={() => handleRowClick(customer)}>
                        <div className="customer-field"><span>Nome:</span> {customer.name}</div>
                        <div className="customer-field"><span>Documento:</span> {customer.document}</div>
                        <div className="customer-field"><span>Email:</span> {customer.email}</div>
                        <div className="customer-field"><span>Telefone:</span> {customer.phone}</div>
                        <div className="action-buttons" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleOpenEditModal(customer)} className="edit-btn">Editar</button>
                            <button onClick={() => handleDeleteCustomer(customer.id)} className="delete-btn">Excluir</button>
                        </div>
                    </div>
                ))}
            </div>

            <CustomerModal
                isOpen={modalState.type === 'create' || modalState.type === 'edit'}
                onClose={() => setModalState({ type: null, data: null })}
                onSave={handleSaveCustomer}
                customerToEdit={modalState.type === 'edit' ? modalState.data : null}
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
