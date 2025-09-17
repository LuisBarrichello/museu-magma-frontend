import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api.js';

const useApi = (endpoint) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(endpoint);
            setData(response.data.results || response.data);
            setError(null);
        } catch (error) {
            setError(error.message || 'Ocorreu um erro ao buscar os dados.');
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, setData, loading, error, refetch: fetchData };
};

export default useApi;