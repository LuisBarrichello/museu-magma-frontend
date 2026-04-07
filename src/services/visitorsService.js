// =============================================
// ARQUIVO: src/services/visitorsService.js
// =============================================
// Serviço de Visitantes.
// Usa o "apiClient" — o mesmo Axios configurado nos outros services
// do projeto. Ele já envia o token JWT automaticamente em toda
// requisição, então não precisamos passar o token aqui.

import apiClient from './api'; // mesmo import que os outros services usam

/**
 * Busca a lista de visitantes com suporte a busca e paginação.
 *
 * @param {object} params
 * @param {string} params.search  - Texto para filtrar por nome ou documento
 * @param {number} params.page    - Página atual (começa em 1)
 * @param {number} params.limit   - Itens por página (padrão: 10)
 *
 * @returns {Promise<{ count, next, previous, results }>}
 */
export async function getVisitors({ search = '', page = 1, limit = 10 } = {}) {
    // Calcula o offset (quantos registros pular)
    // Exemplo: página 3, 10 por página → offset = 20
    const offset = (page - 1) * limit;

    // Faz GET /visitors/ com os parâmetros como query string
    // O apiClient já monta a URL base e injeta o header Authorization
    const response = await apiClient.get('/visitors/', {
        params: {
            ...(search && { search }), // só inclui "search" se tiver valor
            limit,
            offset,
        },
    });

    // Axios já faz o parse do JSON e coloca em response.data
    return response.data;
}