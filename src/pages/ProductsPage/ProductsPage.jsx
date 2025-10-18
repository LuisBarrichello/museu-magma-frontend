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
    { label: 'Preço de Venda', key: 'sale_price', format: (value) => `R$ ${value}` },
    { label: 'Preço de Custo', key: 'cost_price', format: (value) => `R$ ${value}` },
    { label: 'Margem de Lucro', key: 'profit_margin', format: (value) => `${value}%` },
    { label: 'Estoque Atual', key: 'quantity' },
    { label: 'Unidade', key: 'unit_of_measure_display' },
    { label: 'Estoque Mínimo', key: 'minimum_quantity' },
    { label: 'Fornecedor', key: 'supplier' },
    { label: 'Criado em', key: 'created_at', format: (value) => new Date(value).toLocaleDateString('pt-BR') },
    { label: 'Status', key: 'is_active', format: (value) => (value ? 'Ativo' : 'Inativo') },
];

const ProductsPage = () => {
    const { data: products, setData: setProducts, loading, error } = useApi('/products/');
    const { user } = useAuth();
    const [saveError, setSaveError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const canManageProducts = user?.user_type === 'ADMIN' || user?.user_type === 'STOCKCLERK';

    const handleRowClick = (product) => setModalState({ type: 'details', data: product });
    const handleOpenCreateModal = () => setModalState({ type: 'create', data: null });
    const handleOpenEditModal = (product) => setModalState({ type: 'edit', data: product });

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await apiClient.delete(`/products/${productId}/`);
                setProducts(products.filter((p) => p.id !== productId));
            } catch (err) {
                setSaveError(err.message || 'Não foi possível excluir o produto.');
            }
        }
    };

    const handleSaveProduct = async (productData, productId) => {
        try {
            if (productId) {
                const response = await apiClient.patch(`/products/${productId}/`, productData);
                setProducts(products.map((p) => (p.id === productId ? response.data : p)));
            } else {
                const response = await apiClient.post('/products/', productData);
                setProducts((prev) => [response.data, ...prev]);
            }
            setModalState({ type: null, data: null });
        } catch (error) {
            console.error('Falha ao criar produto:', error.response?.data);
            setSaveError(error.message || 'Não foi possível salvar o produto. Verifique os dados.');
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="products-page">
            <header className="page-header">
                <h1>Gerenciamento de Produtos</h1>
                {canManageProducts && (
                    <button className="add-product-btn" onClick={handleOpenCreateModal}>
                        + Adicionar Produto
                    </button>
                )}
            </header>

            <div className="products-list-container">
                {products.map((product) => (
                    <div key={product.id} className="product-card" onClick={() => handleRowClick(product)}>
                        <div className="product-row">
                            <div className="product-field"><span>Nome:</span> {product.name}</div>
                            <div className="product-field"><span>Código:</span> {product.code}</div>
                            <div className="product-field"><span>Categoria:</span> {product.category_display}</div>
                        </div>
                        <div className="product-row">
                            <div className="product-field"><span>Preço Venda:</span> R$ {product.sale_price}</div>
                            <div className="product-field"><span>Estoque:</span> {product.quantity}</div>
                            <div className="product-field"><span>Fornecedor:</span> {product.supplier}</div>
                        </div>
                        {canManageProducts && (
                            <div className="product-row action-buttons" onClick={(e) => e.stopPropagation()}>
                                <button className="edit-btn" onClick={() => handleOpenEditModal(product)}>Editar</button>
                                <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>Excluir</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ProductModal
                isOpen={modalState.type === 'edit' || modalState.type === 'create'}
                onClose={() => setModalState({ type: null, data: null })}
                onSave={handleSaveProduct}
                productToEdit={modalState.type === 'edit' ? modalState.data : null}
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
