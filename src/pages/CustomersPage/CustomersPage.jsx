import React, { useState } from 'react';
import useApi from '../../hooks/useApi';
import apiClient from '../../services/api';
import Spinner from '../../components/common/Spinner/Spinner';
import CustomerModal from '../../components/CustomerModal/CustomerModal';
import './CustomersPage.css';

const CustomersPage = () => {
    const {
        data: customers,
        setData: setCustomers,
        loading,
        error,
    } = useApi('/customers/');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [actionError, setActionError] = useState(null);

    const handleOpenCreateModal = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    }

    const handleOpenEditModal = (customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    }

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
                setIsModalOpen(false);
            } else {
                const response = await apiClient.post('/customers/', customerData);
                setCustomers((prevCustomers) => [
                    response.data,
                    ...prevCustomers,
                ]);
                setIsModalOpen(false);
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
    }

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="customers-page">
            <header className="page-header">
                <h1>Gerenciamento de Clientes</h1>
                <button onClick={handleOpenCreateModal} className="add-btn">
                    + Adicionar Cliente
                </button>
            </header>
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
                            <tr key={customer.id}>
                                <td>{customer.name}</td>
                                <td>{customer.document}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() =>
                                            handleOpenEditModal(customer)
                                        }
                                        className="edit-btn">
                                        Editar
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteCustomer(customer.id)
                                        }
                                        className="delete-btn">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCustomer}
                customerToEdit={editingCustomer}
            />
        </div>
    );
};

export default CustomersPage;
