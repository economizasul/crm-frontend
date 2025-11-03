// src/services/ReportService.js

import api from './api'; // Importa a instância configurada do seu cliente Axios/Fetch

// ==========================================================
// 1. DADOS DO DASHBOARD
// ==========================================================

/**
 * Busca todas as métricas do dashboard com base nos filtros.
 * @param {Object} filters - { startDate, endDate, vendorId, source, ... }
 */
export const fetchDashboardMetrics = async (filters) => {
    try {
        // Usa POST para enviar filtros complexos no corpo da requisição
        const response = await api.post('/reports/data', { 
            filters,
        });
        return response.data.data; 
        
    } catch (error) {
        console.error("Erro ao buscar métricas:", error);
        throw error;
    }
};

// ==========================================================
// 2. DADOS ANALÍTICOS (NOTAS DO LEAD) - (Se for implementado em outro lugar, pode ser omitido)
// ==========================================================

/**
 * Busca dados analíticos e notas para um Lead específico.
 * @param {number} leadId 
 */
export const fetchAnalyticNotes = async (leadId) => {
    try {
        const response = await api.get(`/reports/analytic?leadId=${leadId}`);
        return response.data.data;
        
    } catch (error) {
        console.error(`Erro ao buscar notas do Lead ${leadId}:`, error);
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
        const params = new URLSearchParams(filters).toString();
        
        const response = await api.get(`/reports/export/csv?${params}`, {
            responseType: 'blob', 
        });

        // Lógica de download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'relatorio_leads.csv'); 
        document.body.appendChild(link);
        link.click();
        link.remove();

    } catch (error) {
        console.error("Erro no download CSV:", error);
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

        // Lógica de download
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'relatorio_resumo.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        
    } catch (error) {
        console.error("Erro no download PDF:", error);
        throw error;
    }
};