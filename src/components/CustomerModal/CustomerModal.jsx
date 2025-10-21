import React, { useState, useEffect } from 'react';
import './CustomerModal.css';

const CUSTOMER_TYPE_CHOICES = [
    { value: 'PF', label: 'Pessoa Física' },
    { value: 'PJ', label: 'Pessoa Jurídica' },
];

// --- Funções de Máscara ---
const applyPhoneMask = (value) => {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15); // Limita ao formato (XX) XXXXX-XXXX
};

const applyDocumentMask = (value, type) => {
    if (!value) return '';
    const cleanedValue = value.replace(/\D/g, '');

    if (type === 'PF') {
        return cleanedValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .slice(0, 14); 
    }
    
    return cleanedValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .slice(0, 18); 
};

const CustomerModal = ({ isOpen, onClose, onSave, customerToEdit }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({}); 
    const isEditing = !!customerToEdit;

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: customerToEdit?.name || '',
                document: customerToEdit?.document || '',
                customer_type: customerToEdit?.customer_type || 'PF',
                email: customerToEdit?.email || '',
                phone: customerToEdit?.phone || '',
                notes: customerToEdit?.notes || '',
            });
            setErrors({}); 
        }
    }, [customerToEdit, isOpen]);

    const validate = () => {
        const newErrors = {};
        const documentDigits = formData.document.replace(/\D/g, '');

        if (!formData.name.trim()) newErrors.name = 'O nome é obrigatório.';
        if (!formData.phone.trim())
            newErrors.phone = 'O telefone é obrigatório.';

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'O formato do email é inválido.';
        }

        if (!formData.document.trim()) {
            newErrors.document = 'O documento é obrigatório.';
        } else if (
            formData.customer_type === 'PF' &&
            documentDigits.length !== 11
        ) {
            newErrors.document = 'O CPF deve conter 11 dígitos.';
        } else if (
            formData.customer_type === 'PJ' &&
            documentDigits.length !== 14
        ) {
            newErrors.document = 'O CNPJ deve conter 14 dígitos.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'phone') {
            value = applyPhoneMask(value);
        }
        if (name === 'document') {
            value = applyDocumentMask(value, formData.customer_type);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const dataToSave = {
                ...formData,
                document: formData.document.replace(/\D/g, ''),
                phone: formData.phone.replace(/\D/g, ''),
            };
            onSave(dataToSave, customerToEdit ? customerToEdit.id : null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>
                    {isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label>Nome Completo / Razão Social</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && (
                            <span className="error-message">{errors.name}</span>
                        )}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>CPF / CNPJ</label>
                            <input
                                type="text"
                                name="document"
                                value={formData.document}
                                onChange={handleChange}
                            />
                            {errors.document && (
                                <span className="error-message">
                                    {errors.document}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Tipo de Cliente</label>
                            <select
                                name="customer_type"
                                value={formData.customer_type}
                                onChange={handleChange}>
                                {CUSTOMER_TYPE_CHOICES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && (
                                <span className="error-message">
                                    {errors.email}
                                </span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Telefone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && (
                                <span className="error-message">
                                    {errors.phone}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Observações</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}></textarea>
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Salvar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
