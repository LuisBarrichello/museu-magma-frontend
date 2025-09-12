import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api-museu-magma.onrender.com/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});


// ===================================================================
// Request Interceptor - This interceptor runs BEFORE each request is sent.
// ===================================================================
apiClient.interceptors.request.use(
    (config) => {
        const acessToken = localStorage.getItem('accessToken'); 

        if (acessToken) {
            config.headers.Authorization = `Bearer ${acessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;