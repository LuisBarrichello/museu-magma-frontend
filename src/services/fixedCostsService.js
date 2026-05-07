import apiClient from './api';

const BASE = '/fixed-cost-entries/';

export async function listFixedCostEntries(params = {}) {
    const { data } = await apiClient.get(BASE, { params });
    return data;
}

export async function getFixedCostsSummary(params = {}) {
    const { data } = await apiClient.get(`${BASE}summary/`, { params });
    return data;
}

export async function createFixedCostEntry(payload) {
    const { data } = await apiClient.post(BASE, payload);
    return data;
}

export async function updateFixedCostEntry(id, payload) {
    const { data } = await apiClient.patch(`${BASE}${id}/`, payload);
    return data;
}

export async function deleteFixedCostEntry(id) {
    const { data } = await apiClient.delete(`${BASE}${id}/`);
    return data;
}
