// src/services/ReportService.js
import api from './api';
// Assumindo que o './api' é a sua instância configurada do Axios

// ==========================================================
// 📊 DASHBOARD PRINCIPAL
// ==========================================================
export const fetchDashboardMetrics = async (filters) => {
  try {
    // Usa POST para enviar filtros no corpo. O backend espera { filters: {...} }
    const response = await api.post('/reports/data', { filters }); 
    
    if (!response.data || !response.data.success) {
      // Trata caso a API retorne um sucesso: false
      throw new Error(response.data?.message || 'Resposta de API de relatórios falhou.');
    }
    
    return response.data?.data || null;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    // Propaga o erro para o useReports, que exibe a mensagem de falha na tela.
    throw error; 
  }
};

// ==========================================================
// 🗒️ NOTAS ANALÍTICAS (Relatório Analítico de Atendimento)
// ==========================================================
export const fetchAnalyticNotes = async (leadId, stage) => {
    let url = '/reports/analytic';
    const params = {};

    if (leadId) {
        // Busca notas de um lead específico: /reports/analytic/lead/123
        url = `/reports/analytic/lead/${leadId}`;
    } else if (stage) {
        // Busca leads ativos em uma fase: /reports/analytic/stage?stage=Proposta Enviada
        url = `/reports/analytic/stage`;
        params.stage = stage;
    } else {
        throw new Error('É necessário fornecer leadId ou stage para o Relatório Analítico.');
    }
    
    try {
        const response = await api.get(url, { params });

        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error('Resposta inesperada da API de Análise de Atendimento.');
    } catch (error) {
        console.error('Erro ao buscar notas analíticas:', error);
        throw error;
    }
};

// ==========================================================
// 📦 EXPORTAÇÕES (CSV / PDF)
// ==========================================================
const getFilenameFromHeader = (response, defaultFilename) => {
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=UTF-8''(.+?)(?:;|$)|filename="(.+?)"/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    } else if (match && match[2]) {
      return match[2];
    }
  }
  return defaultFilename;
};

// 🟢 CSV
export const downloadCsvReport = async (filters) => {
  let url = null;
  try {
    // Usa POST para enviar filtros no corpo
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

// 🔵 PDF
export const downloadPdfReport = async (filters) => {
  let url = null;
  try {
    // Usa POST para enviar filtros no corpo
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