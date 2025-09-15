import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';
import ProductModal from '../../components/ProductModal/ProductModal';
import './ProductsPage.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/products/');
                setProducts(response.data.results);
                console.log('Fetched products:', response.data.results);
                setError(null);
            } catch (error) {
                setError('Failed to fetch products');
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [])

    const handleSaveProduct = async (productData) => {
        try {
            const response = await apiClient.post('/products/', productData);
            setProducts(prevProducts => [response.data, ...prevProducts]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Falha ao criar produto:', error.response?.data);
            setError('Não foi possível salvar o produto. Verifique os dados.');
        }
    };

    const canManageProducts =
        user?.user_type === 'ADMIN' || user?.user_type === 'STOCKCLERK';
    
    if (loading) {
        return <div className="loading-message">Carregando produtos...</div>;
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
                        onClick={() => setIsModalOpen(true)}>
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
                                        <button className="edit-btn">
                                            Editar
                                        </button>
                                        <button className="delete-btn">
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
            />
        </div>
    );
};

export default ProductsPage;
