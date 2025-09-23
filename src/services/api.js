import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
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

// ===================================================================
// NEW: Response Interceptor (handles global errors)
// ===================================================================
apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const response = await apiClient.post('/token/refresh/', {
                    refreshToken: refreshToken,
                });

                const newAcessToken = response.data.acessToken;

                localStorage.setItem('accessToken', newAcessToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAcessToken}`;

                originalRequest.headers['Authorization'] = `Bearer ${newAcessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
)

export default apiClient;