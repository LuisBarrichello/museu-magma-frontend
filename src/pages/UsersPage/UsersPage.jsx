import React, { useState } from 'react';
import apiClient from '../../services/api';
import useApi from '../../hooks/useApi';
import UserModal from '../../components/UserModal/UserModal';
import Spinner from '../../components/common/Spinner/Spinner';
import DetailsModal from '../../components/common/DetailsModal/DetailsModal';
import './UsersPage.css';

const formatFullName = (user) => {
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`.trim();
};

const userDetailsConfig = [
    { label: 'ID', key: 'id' },
    { label: 'Nome de Usuário', key: 'username' },
    { label: 'Email', key: 'email' },
    {
        label: 'Nome Completo',
        key: 'full_name',  
        format: (value, user) => formatFullName(user),
    },
    { label: 'Tipo de Usuário', key: 'user_type_display' },
    { label: 'Saldo', key: 'balance', format: (value) => `R$ ${value}` },
    {
        label: 'Status',
        key: 'is_active',
        format: (value) => (value ? 'Ativo' : 'Inativo'),
    },
];

const UsersPage = () => {
    const {
        data: users,
        setData: setUsers,
        loading,
        error,
    } = useApi('/users/');
    const [saveError, setSaveError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const handleRowClick = (user) => {
        setModalState({ type: 'details', data: user });
    };

    const handleOpenCreateModal = () => {
        setModalState({ type: 'create', data: null });
    };

    const handleOpenEditModal = (user) => {
        setModalState({ type: 'edit', data: user });
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await apiClient.delete(`/users/${userId}/`);
                setUsers(users.filter((u) => u.id !== userId));
            } catch (error) {
                setSaveError(
                    error.message || 'Não foi possível excluir o usuário.',
                );
            }
        }
    };

    const handleSaveUser = async (userData, userId) => {
        try {
            setSaveError(null);
            if (userId) {
                const response = await apiClient.patch(
                    `/users/${userId}/`,
                    userData,
                );
                setUsers(
                    users.map((u) => (u.id === userId ? response.data : u)),
                );
            } else {
                const response = await apiClient.post('/users/', userData);
                setUsers([response.data, ...users]);
            }
            setModalState({ type: null, data: null });
        } catch (error) {
            setSaveError(
                error.message ||
                    'Não foi possível salvar o usuário. Verifique os dados.',
            );
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="users-page">
            <header className="page-header">
                <h1>Gerenciamento de Usuários</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="add-user-btn">
                    + Adicionar Usuário
                </button>
            </header>

            <div className="users-list-container">
                <table>
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Nome Completo</th>
                            <th>Email</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                onClick={() => handleRowClick(user)}
                                className="clickable-row">
                                <td>{user.username}</td>
                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                <td>{user.email}</td>
                                <td>{user.user_type_display}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() =>
                                            handleOpenEditModal(user)
                                        }
                                        className="edit-btn">
                                        Editar
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteUser(user.id)
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

            <UserModal
                isOpen={
                    modalState.type === 'create' || modalState.type === 'edit'
                }
                onClose={() => setModalState({ type: null, data: null })}
                onSave={handleSaveUser}
                userToEdit={modalState.data}
                error={saveError}
            />

            <DetailsModal
                isOpen={modalState.type === 'details'}
                onClose={() => setModalState({ type: null, data: null })}
                title="Detalhes do Usuário"
                data={modalState.data}
                config={userDetailsConfig}
            />
        </div>
    );
};

export default UsersPage;
