// src/services/ReportService.js

import api from './api'; 

// ==========================================================
// 1. DADOS DO DASHBOARD
// ==========================================================

/**
 * Busca todas as métricas do dashboard com base nos filtros.
 * @param {Object} filters - { startDate, endDate, ownerId, status, ... }
 * @param {Object} authContext - { userId, isAdmin }
 */
export const fetchDashboardMetrics = async (filters, authContext) => {
    try {
        // Usa POST para enviar filtros complexos no corpo da requisição
        const response = await api.post('/reports', { 
            // Os dados do usuário logado e os filtros são enviados no corpo
            filters: filters,
            context: authContext 
        });
        // Retorna a estrutura de dados (data: metrics)
        return response.data.data; 
        
    } catch (error) {
        // Lança o erro para ser tratado pelo hook ou componente
        throw error;
    }
};

// ==========================================================
// 2. DADOS ANALÍTICOS (NOTAS DO LEAD)
// ==========================================================

/**
 * Busca dados analíticos e notas para um Lead específico.
 * @param {number} leadId 
 */
export const fetchAnalyticNotes = async (leadId) => {
    try {
        // ⭐️ CORREÇÃO: Usando URL parameter /analytic/:leadId (conforme rota do backend)
        const response = await api.get(`/reports/analytic/${leadId}`);
        return response.data.data;
        
    } catch (error) {
        throw error;
    }
};

// ==========================================================
// 3. EXPORTAÇÃO
// ==========================================================

/**
 * Inicia o download do relatório em CSV.
 * @param {Object} filters - Filtros a serem passados como query params.
 */
export const downloadCsvReport = async (filters) => {
    try {
        // Converte o objeto de filtros em string de query params
        const params = new URLSearchParams(filters).toString();
        
        // Chama a rota de exportação e informa ao Axios para tratar a resposta como 'blob' (arquivo binário)
        const response = await api.get(`/reports/export/csv?${params}`, {
            responseType: 'blob', 
        });

        // Retorna o objeto de resposta completo (incluindo headers para nome do arquivo)
        return response;

    } catch (error) {
        throw error;
    }
};

/**
 * Inicia o download do relatório em PDF.
 * @param {Object} filters - Filtros a serem passados como query params.
 */
export const downloadPdfReport = async (filters) => {
    try {
        const params = new URLSearchParams(filters).toString();
        
        const response = await api.get(`/reports/export/pdf?${params}`, {
            responseType: 'blob',
        });

        // Retorna o objeto de resposta completo
        return response;

    } catch (error) {
        throw error;
    }
};