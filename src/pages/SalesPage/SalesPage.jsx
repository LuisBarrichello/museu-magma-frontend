import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import Spinner from '../../components/common/Spinner/Spinner';
import './SalesPage.css'; 

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSales = async () => {
        try {
            const response = await apiClient.get('/sales/');
            setSales(response.data.results);
        } catch (error) {
            setError(
                error.message || 'Falha ao carregar o histórico de vendas.',
            );
            console.error('Failed to fetch sales', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSales();
    }, []);

    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="sales-page">
            <header className="page-header">
                <h1>Histórico de Vendas</h1>
                <Link to="/sales/new" className="new-sale-btn">
                    + Nova Venda
                </Link>
            </header>
            <div className="list-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID Venda</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Vendedor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td>#{sale.id}</td>
                                <td>
                                    {new Date(
                                        sale.sale_date,
                                    ).toLocaleDateString('pt-BR')}
                                </td>
                                <td>{sale.customer_name || 'N/A'}</td>
                                <td>R$ {sale.total_amount}</td>
                                <td>{sale.status_display}</td>
                                <td>{sale.created_by_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesPage;
