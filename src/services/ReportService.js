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
            // ⭐️ CORREÇÃO CRÍTICA: Encapsula os filtros em 'context' para o Backend
            context: { filters }, 
        });
        return response.data.data; 
        
    } catch (error) {
        console.error("Erro ao buscar métricas:", error);
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

// Função auxiliar para extrair o nome do arquivo do cabeçalho
const getFilenameFromHeader = (response, defaultFilename) => {
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
        // Regex para encontrar filename="nome-do-arquivo.ext"
        const match = contentDisposition.match(/filename\*?=UTF-8''(.+?)(?:;|$)|filename="(.+?)"/i);
        if (match && match[1]) return decodeURIComponent(match[1]); // UTF-8 filename*
        if (match && match[2]) return match[2]; // Regular filename
    }
    return defaultFilename;
};


/**
 * Inicia o download do relatório em CSV.
 * @param {Object} filters - Filtros a serem passados como query params.
 */
export const downloadCsvReport = async (filters) => {
    let url = null;
    try {
        const params = new URLSearchParams(filters).toString();
        
        const response = await api.get(`/reports/export/csv?${params}`, {
            responseType: 'blob', 
        });

        // ⭐️ ADIÇÃO 1: Nome do arquivo dinâmico
        const filename = getFilenameFromHeader(response, 'relatorio_leads.csv');
        
        // Lógica de download
        url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // ⭐️ ADIÇÃO 2: Usa o nome de arquivo extraído do cabeçalho
        link.setAttribute('download', filename); 
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // ⭐️ ADIÇÃO 3: Libera o objeto Blob da memória
        window.URL.revokeObjectURL(url); 

    } catch (error) {
        console.error("Erro no download CSV:", error);
        // Garante a limpeza em caso de erro
        if (url) window.URL.revokeObjectURL(url);
        throw error;
    }
};

/**
 * Inicia o download do relatório em PDF.
 * @param {Object} filters - Filtros a serem passados como query params.
 */
export const downloadPdfReport = async (filters) => {
    let url = null;
    try {
        const params = new URLSearchParams(filters).toString();
        
        const response = await api.get(`/reports/export/pdf?${params}`, {
            responseType: 'blob',
        });

        // ⭐️ ADIÇÃO 1: Nome do arquivo dinâmico
        const filename = getFilenameFromHeader(response, 'relatorio_resumo.pdf');

        // Lógica de download
        url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        // ⭐️ ADIÇÃO 2: Usa o nome de arquivo extraído do cabeçalho
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // ⭐️ ADIÇÃO 3: Libera o objeto Blob da memória
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Erro no download PDF:", error);
        // Garante a limpeza em caso de erro
        if (url) window.URL.revokeObjectURL(url);
        throw error;
    }
};