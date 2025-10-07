import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api.js';

const useApi = (endpoint, params = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [count, setCount] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(endpoint, { params });
            setData(response.data.results || response.data);
            setCount(response.data.count || 0);
            setError(null);
        } catch (error) {
            setError(error.message || 'Ocorreu um erro ao buscar os dados.');
            setData([]);
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, [endpoint, JSON.stringify(params)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, setData, count, loading, error, refetch: fetchData };
};

export default useApi;
