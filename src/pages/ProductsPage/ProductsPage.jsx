import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';
import useApi from '../../hooks/useApi';
import ProductModal from '../../components/ProductModal/ProductModal';
import './ProductsPage.css';
import Spinner from '../../components/common/Spinner/Spinner';
import DetailsModal from '../../components/common/DetailsModal/DetailsModal';

const productDetailsConfig = [
    { label: 'Nome', key: 'name' },
    { label: 'Código', key: 'code' },
    { label: 'Categoria', key: 'category_display' },
    {
        label: 'Preço de Venda',
        key: 'sale_price',
        format: (value) => `R$ ${value}`,
    },
    {
        label: 'Preço de Custo',
        key: 'cost_price',
        format: (value) => `R$ ${value}`,
    },
    {
        label: 'Margem de Lucro',
        key: 'profit_margin',
        format: (value) => `${value}%`,
    },
    { label: 'Estoque Atual', key: 'quantity' },
    { label: 'Unidade', key: 'unit_of_measure_display' },
    { label: 'Estoque Mínimo', key: 'minimum_quantity' },
    { label: 'Fornecedor', key: 'supplier' },
    {
        label: 'Criado em',
        key: 'created_at',
        format: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
        label: 'Status',
        key: 'is_active',
        format: (value) => (value ? 'Ativo' : 'Inativo'),
    },
];

const ProductsPage = () => {
    const {
        data: products,
        setData: setProducts,
        loading,
        error,
    } = useApi('/products/');
    const { user } = useAuth();
    const [saveError, setSaveError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const handleRowClick = (product) => {
        setModalState({ type: 'details', data: product });
    };

    const handleOpenCreateModal = () => {
        setModalState({ type: 'create', data: null });
    }

    const handleOpenEditModal = (product) => {
        setModalState({ type: 'edit', data: product });
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await apiClient.delete(`/products/${productId}/`);
                setProducts(products.filter((p) => p.id !== productId));
            } catch (err) {
                setSaveError(
                    err.message || 'Não foi possível excluir o produto.',
                );
            }
        }
    };

    const handleSaveProduct = async (productData, productId) => {
        try {
            if (productId) {
                const response = await apiClient.patch(
                    `/products/${productId}/`,
                    productData,
                );
                setProducts(
                    products.map((p) =>
                        p.id === productId ? response.data : p,
                    ),
                );
            } else {
                const response = await apiClient.post('/products/', productData);
                setProducts((prevProducts) => [response.data, ...prevProducts]);
            }
            
            setModalState({ type: null, data: null });
        } catch (error) {
            console.error('Falha ao criar produto:', error.response?.data);
            setSaveError(
                error.message ||
                    'Não foi possível salvar o produto. Verifique os dados.',
            );
        }
    };

    const canManageProducts =
        user?.user_type === 'ADMIN' || user?.user_type === 'STOCKCLERK';
    
    if (loading) {
        return <Spinner />;
    }

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="products-page">
            <header className="page-header">
                <h1>Gerenciamento de Produtos</h1>
                {canManageProducts && (
                    <button
                        className="add-product-btn"
                        onClick={handleOpenCreateModal}>
                        + Adicionar Produto
                    </button>
                )}
            </header>

            <div className="products-list-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Código</th>
                            <th>Preço de Venda</th>
                            <th>Estoque</th>
                            <th>Unidade</th>
                            <th>Categoria</th>
                            <th>Fornecedor</th>
                            {canManageProducts && <th>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product.id}
                                onClick={() => handleRowClick(product)}
                                className="clickable-row">
                                <td>{product.name}</td>
                                <td>{product.code}</td>
                                <td>R$ {product.sale_price}</td>
                                <td>{product.quantity}</td>
                                <td>{product.unit_of_measure}</td>
                                <td>{product.category_display}</td>
                                <td>{product.supplier}</td>
                                {canManageProducts && (
                                    <td
                                        className="action-buttons"
                                        onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() =>
                                                handleOpenEditModal(product)
                                            }
                                            className="edit-btn">
                                            Editar
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteProduct(product.id)
                                            }
                                            className="delete-btn">
                                            Excluir
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductModal
                isOpen={
                    modalState.type === 'edit' || modalState.type === 'create'
                }
                onClose={() => setModalState({ type: null, data: null })}
                onSave={handleSaveProduct}
                productToEdit={
                    modalState.type === 'edit' ? modalState.data : null
                }
                error={saveError}
            />

            <DetailsModal
                isOpen={modalState.type === 'details'}
                onClose={() => setModalState({ type: null, data: null })}
                title="Detalhes do Produto"
                data={modalState.data}
                config={productDetailsConfig}
            />
        </div>
    );
};

export default ProductsPage;
