import React, { useState, useEffect } from 'react';
import './UserModal.css';

const USER_TYPE_CHOICES = [
    { value: 'SELLER', label: 'Vendedor' },
    { value: 'STOCKERCLERK', label: 'Estoquista' },
    { value: 'ADMIN', label: 'Administrador' },
];

const UserModal = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [formData, setFormData] = useState({});
    const isEditing = !!userToEdit;

    useEffect(() => {
        if (isOpen) {
            setFormData({
                username: userToEdit?.username || '',
                email: userToEdit?.email || '',
                first_name: userToEdit?.first_name || '',
                last_name: userToEdit?.last_name || '',
                user_type: userToEdit?.user_type || 'SELLER',
                password: '',
            });
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (!dataToSave.password) {
            delete dataToSave.password;
        }
        onSave(dataToSave, userToEdit ? userToEdit.id : null);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content user-modal">
                <h2>
                    {isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Nome de Usuário</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Campo de senha só é obrigatório na criação */}
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            name="password"
                            placeholder={
                                isEditing
                                    ? 'Deixe em branco para não alterar'
                                    : ''
                            }
                            value={formData.password}
                            onChange={handleChange}
                            required={!isEditing}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">Primeiro Nome</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Último Nome</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="user_type">Tipo de Usuário</label>
                        <select
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleChange}>
                            {USER_TYPE_CHOICES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Salvar Usuário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;