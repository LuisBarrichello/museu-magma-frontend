import React, { useState } from 'react';
import apiClient from '../../services/api';
import useApi from '../../hooks/useApi';
import UserModal from '../../components/UserModal/UserModal';
import './UsersPage.css';
import Spinner from '../../components/common/Spinner/Spinner';

const UsersPage = () => {
    const {
        data: users,
        setData: setUsers,
        loading,
        error,
    } = useApi('/users/');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saveError, setSaveError] = useState(null);

    const handleOpenCreateModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
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
            setIsModalOpen(false);
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
                            <tr key={user.id}>
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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={editingUser}
                error={saveError}
            />
        </div>
    );
};

export default UsersPage;
