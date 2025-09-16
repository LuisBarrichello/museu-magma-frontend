import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';
import ProductModal from '../../components/ProductModal/ProductModal';
import './ProductsPage.css';
import Spinner from '../../components/common/Spinner/Spinner';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products/');
            setProducts(response.data.results);
            setError(null);
        } catch (error) {
            setError(error.message || 'Falha ao carregar produtos.');
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [])

    const handleOpenCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    }

    const handleOpenEditModal = (product) => {
        setEditingProduct(product); // Define o produto a ser editado
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (productId) => { 
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await apiClient.delete(`/products/${productId}/`);
                setProducts(products.filter((p) => p.id !== productId));
            } catch (error) {
                console.error('Falha ao excluir produto:', error);
                setError(error.message || 'Não foi possível excluir o produto.');
            }
        }
    }

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
            
            setIsModalOpen(false);
        } catch (error) {
            console.error('Falha ao criar produto:', error.response?.data);
            setError(
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

    if (error) {
        return <div className="error-message">{error}</div>;
    }

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
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.code}</td>
                                <td>R$ {product.sale_price}</td>
                                <td>{product.quantity}</td>
                                <td>{product.unit_of_measure}</td>
                                <td>{product.category_display}</td>
                                <td>{product.supplier}</td>
                                {canManageProducts && (
                                    <td className="action-buttons">
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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                productToEdit={editingProduct}
            />
        </div>
    );
};

export default ProductsPage;
