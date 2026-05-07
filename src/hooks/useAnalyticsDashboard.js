import { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/api.js';

const useAnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unavailable, setUnavailable] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setUnavailable(false);
            const response = await apiClient.get('/analytics/dashboard/');
            setData(response.data);
            setError(null);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404 || status === 501) {
                setUnavailable(true);
                setError(null);
                setData(null);
            } else {
                setUnavailable(false);
                setError(err?.message || 'Ocorreu um erro ao buscar os dados.');
                setData(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, unavailable, refetch: fetchData };
};

export default useAnalyticsDashboard;
