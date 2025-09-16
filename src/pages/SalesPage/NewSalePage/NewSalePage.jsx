import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import apiClient from '../../../services/api.js';
import '../SalesPage.css';

const NewSalePage = () => {
    const [cart, setCart] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('PIX');
    const [discount, setDiscount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (productSearch.length < 2) {
            setSearchResults([]);
            return;
        }

        const dalayDebounceFn = setTimeout(async () => {
            apiClient.get(`/products/?search=${productSearch}`)
                .then(res => setSearchResults(res.data.results))
                .catch(err => console.error('Failed to fetch products', err));
        }, 300); // Debounce for 300ms
        return () => clearTimeout(dalayDebounceFn);
    }, [productSearch])

    const addProductToCart = (product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id);

            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
        setProductSearch('');
        setSearchResults([]);
    }

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(currentCart => currentCart.filter(item => item.id !== productId));
        } else {
            setCart(currentCart => currentCart.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.sale_price * item.quantity), 0);
    const total = subtotal - discount;

    const handleFinalizeSale = async () => {
        const saleData = {
            payment_method: paymentMethod,
            discount: discount,
            items_to_create: cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
            })),
        };

        try {
            await apiClient.post('/sales/', saleData);
            alert('Venda registrada com sucesso!');
            navigate('/sales');
        } catch (error) {
            console.error('Falha ao registrar venda:', error.response?.data);
            alert(`Erro: ${JSON.stringify(error.response?.data)}`);
        }
    }

    return (
        <div className="new-sale-page">
            <header className="page-header">
                <h1>Registrar Nova Venda</h1>
            </header>
            <div className="sale-layout">
                {/* Column Left: search products */}
                <div className="product-search-column">
                    <h3>Buscar Produto</h3>
                    <input
                        type="text"
                        placeholder="Digite o nome ou código do produto..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <ul className="search-results">
                        {searchResults.map((product) => (
                            <li
                                key={product.id}
                                onClick={() => addProductToCart(product)}>
                                {product.name}{' '}
                                <span>(Estoque: {product.quantity})</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column Right: cart and finalize sale */}
                <div className="cart-column">
                    <h3>Itens da Venda</h3>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p>Nenhum item adicionado.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <span>{item.name}</span>
                                    <div className="quantity-control">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateQuantity(
                                                    item.id,
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                            min="0"
                                        />
                                        <span>x R$ {item.sale_price}</span>
                                    </div>
                                    <strong>
                                        R${' '}
                                        {(
                                            item.sale_price * item.quantity
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="sale-summary">
                        <div>
                            <span>Subtotal:</span>{' '}
                            <strong>R$ {subtotal.toFixed(2)}</strong>
                        </div>
                        <div>
                            <label>Desconto (R$):</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) =>
                                    setDiscount(parseFloat(e.target.value) || 0)
                                }
                                min="0"
                            />
                        </div>
                        <hr />
                        <div className="total">
                            <span>TOTAL:</span>{' '}
                            <strong>R$ {total.toFixed(2)}</strong>
                        </div>
                        <div>
                            <label>Método de Pagamento:</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }>
                                <option value="PIX">Pix</option>
                                <option value="CREDIT">
                                    Cartão de Crédito
                                </option>
                                <option value="DEBIT">Cartão de Débito</option>
                                <option value="CASH">Dinheiro</option>
                            </select>
                        </div>
                        <button
                            onClick={handleFinalizeSale}
                            className="finalize-btn"
                            disabled={cart.length === 0}>
                            Finalizar Venda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewSalePage;
