import apiClient from './api';

/**
 * Lista visitas (registros de entrada/saída) com busca e paginação.
 * GET /visits/ — baseURL já inclui /api/v1
 *
 * @param {{ search?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ count, next, previous, results }>}
 */
export async function getVisits({ search = '', page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const response = await apiClient.get('/visits/', {
        params: {
            ...(search && { search }),
            limit,
            offset,
        },
    });
    return response.data;
}
