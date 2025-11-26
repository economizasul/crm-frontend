// src/services/ReportService.js
import api from './api';

// ==========================================================
// DASHBOARD PRINCIPAL
// ==========================================================
export const fetchDashboardMetrics = async (filters) => {
  try {
    const response = await api.post('/reports/data', { filters });
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Resposta de API de relatórios falhou.');
    }
    return response.data?.data || null;
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }
};

// NOVO ENDPOINT PARA RELATÓRIOS FILTRADOS (RESPEITA DATA!)
export const fetchFilteredReport = async (filters) => {
  try {
    // Este é o endpoint correto que respeita startDate e endDate
    const response = await api.post('/api/v1/reports/data', {
      startDate: filters.startDate,
      endDate: filters.endDate,
      ownerId: filters.ownerId === 'all' ? null : filters.ownerId,
      source: filters.source === 'all' ? null : filters.source,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Erro na resposta da API');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao carregar relatório filtrado:', error);
    throw error;
  }
};

// ==========================================================
// NOTAS ANALÍTICAS
// ==========================================================
export const fetchAnalyticNotes = async (leadId, stage) => {
  let url = '/reports/analytic';
  const params = {};

  if (leadId) {
    url = `/reports/analytic/lead/${leadId}`;
  } else if (stage) {
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
// NOVO: BUSCA LEADS GANHO COM COORDENADAS PARA O MAPA
// ==========================================================
const geocodeCache = new Map();

const extrairCoordenadasDoLinkGoogleMaps = async (link) => {
  if (!link) return null;
  if (geocodeCache.has(link)) return geocodeCache.get(link);

  try {
    let url = link;

    // Resolve links curtos do Google (maps.app.goo.gl)
    if (link.includes('maps.app.goo.gl')) {
      const res = await fetch(link, { redirect: 'follow' });
      url = res.url;
    }

    // Extrai coordenadas de qualquer formato
    const match = url.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
                  url.match(/query=(-?\d+\.?\d+),(-?\d+\.?\d+)/);

    if (match) {
      const coords = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      geocodeCache.set(link, coords);
      return coords;
    }

    return null;
  } catch (err) {
    console.warn('Falha ao extrair coordenadas:', link);
    return null;
  }
};

export const buscarLeadsGanhoParaMapa = async (filters = {}) => {
  try {
    const response = await api.post('reports/leads-ganho-mapa', { filters });
    if (!response.data?.success) throw new Error('Erro na API de mapa');

    const leads = response.data.data || [];

    const leadsComCoords = await Promise.all(
      leads.map(async (lead) => {
        let latitude = lead.lat || null;
      let longitude = lead.lng || null;

      if (!latitude || !longitude) {
        const coords = await extrairCoordenadasDoLinkGoogleMaps(lead.google_maps_link);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      }

      return {
        ...lead,
        lat: latitude,
        lng: longitude,
        cidade: lead.cidade || 'Cidade não informada',
        regiao: lead.regiao || 'Outros',
      };

      })
    );

    return leadsComCoords.filter(l => l.lat && l.lng);
  } catch (error) {
    console.error('Erro ao carregar leads para o mapa:', error);
    return [];
  }
};

// ==========================================================
// EXPORTAÇÕES (CSV / PDF)
// ==========================================================
const getFilenameFromHeader = (response, defaultFilename) => {
  const header = response.headers['content-disposition'];
  if (!header) return defaultFilename;
  const match = header.match(/filename\*?=UTF-8''(.+?)(?:;|$)|filename="(.+?)"/i);
  return match ? decodeURIComponent(match[1] || match[2]) : defaultFilename;
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