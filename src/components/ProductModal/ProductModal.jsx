import React, { useState, useEffect } from 'react';
import './ProductModal.css';

const CATEGORY_CHOICES = [
    { value: 'FOSSIL', label: 'Fóssil' },
    { value: 'ARTISANSHIP', label: 'Artesanato' },
    { value: 'MINERAL', label: 'Mineral' },
    { value: 'OTHER', label: 'Outro' },
];

const UNIT_CHOICES = [
    { value: 'UNIT', label: 'Unidade' },
    { value: 'KG', label: 'Quilograma' },
    { value: 'LT', label: 'Litro' },
    { value: 'MT', label: 'Metro' },
];

const ProductModal = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        cost_price: '',
        profit_margin: '',
        quantity: '',
        category: 'OTHER',
        unit_of_measure: 'UNIT',
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name || '',
                cost_price: productToEdit.cost_price || '',
                profit_margin: productToEdit.profit_margin || '',
                quantity: productToEdit.quantity || '',
                category: productToEdit.category || 'OTHER',
                unit_of_measure: productToEdit.unit_of_measure || 'UNIT',
            });
        } else {
            setFormData({
                name: '',
                cost_price: '',
                profit_margin: '',
                quantity: '',
                category: 'OTHER',
                unit_of_measure: 'UNIT',
            });
        }
    }, [productToEdit, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>
                    {productToEdit
                        ? 'Editar Produto'
                        : 'Adicionar Novo Produto'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome do Produto</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cost_price">
                                Preço de Custo (R$)
                            </label>
                            <input
                                type="number"
                                name="cost_price"
                                value={formData.cost_price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profit_margin">
                                Margem de Lucro (%)
                            </label>
                            <input
                                type="number"
                                name="profit_margin"
                                value={formData.profit_margin}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="quantity">Quantidade Inicial</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="unit_of_measure">
                                Unidade de Medida
                            </label>
                            <select
                                name="unit_of_measure"
                                value={formData.unit_of_measure}
                                onChange={handleChange}>
                                {UNIT_CHOICES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Categoria</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}>
                            {CATEGORY_CHOICES.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="supplier">Fornecedor</label>
                        <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Salvar Produto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;