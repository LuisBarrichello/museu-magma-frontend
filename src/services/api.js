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

// ===================================================================
// NEW: Response Interceptor (handles global errors)
// ===================================================================
apiClient.interceptors.response.use(
    (response) => response,

    (error) => {
        const { response } = error;

        if (response) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                window.location.href = '/login';

                return Promise.reject(
                    new Error('Sessão inválida ou expirada.')
                );
            }

            if (
                response.data &&
                response.data.errors &&
                response.data.errors.detail
            ) {
                const errorDetail = response.data.errors.detail;

                if (typeof errorDetail === 'object') {
                    const messages = Object.entries(errorDetail).map(
                        ([key, value]) => `${key}: ${value.join(', ')}`,
                    );
                    error.message = messages.join('\n');
                } else {
                    error.message = errorDetail;
                }
            }
        } else {
            error.message =
                'Não foi possível se conectar ao servidor. Verifique sua conexão com a internet.';
        }

        return Promise.reject(error);
    }
)

export default apiClient;