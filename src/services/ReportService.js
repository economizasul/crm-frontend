// src/services/ReportService.js
import api from './api';

// ==========================================================
// DASHBOARD
// ==========================================================
export const fetchDashboardMetrics = async (filters) => {
  try {
    // Envia os filtros diretamente no corpo, sem o campo "context"
    const response = await api.post('/reports', { filters });
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }
};

// ==========================================================
// NOTAS ANALÍTICAS
// ==========================================================
export const fetchAnalyticNotes = async (leadId) => {
  try {
    const response = await api.get(`/reports/notes/${leadId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Erro ao buscar notas do Lead ${leadId}:`, error);
    throw error;
  }
};

// ==========================================================
// EXPORTAÇÕES
// ==========================================================
const getFilenameFromHeader = (response, defaultFilename) => {
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=UTF-8''(.+?)(?:;|$)|filename="(.+?)"/i);
    if (match && match[1]) return decodeURIComponent(match[1]);
    if (match && match[2]) return match[2];
  }
  return defaultFilename;
};

export const downloadCsvReport = async (filters) => {
  let url = null;
  try {
    const response = await api.post('/reports/export/csv', { filters }, { responseType: 'blob' });
    const filename = getFilenameFromHeader(response, 'relatorio_leads.csv');

    url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro no download CSV:', error);
    if (url) window.URL.revokeObjectURL(url);
    throw error;
  }
};

export const downloadPdfReport = async (filters) => {
  let url = null;
  try {
    const response = await api.post('/reports/export/pdf', { filters }, { responseType: 'blob' });
    const filename = getFilenameFromHeader(response, 'relatorio_resumo.pdf');

    url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro no download PDF:', error);
    if (url) window.URL.revokeObjectURL(url);
    throw error;
  }
};
