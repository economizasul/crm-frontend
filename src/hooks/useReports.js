// src/hooks/useReports.js
import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardMetrics,
  fetchFilteredReport,
  downloadCsvReport,
  downloadPdfReport,
  fetchAnalyticNotes as fetchAnalyticNotesAPI
} from '../services/ReportService';

/**
 * Helpers para acessar caminhos possíveis em estruturas diferentes
 */
const tryPathsNumber = (obj, paths = []) => {
  for (const p of paths) {
    if (!obj) continue;
    const parts = p.split('.');
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (cur === undefined || cur === null || !(part in cur)) { ok = false; break; }
      cur = cur[part];
    }
    if (ok && cur !== undefined && cur !== null && !Number.isNaN(Number(cur))) return Number(cur);
  }
  return 0;
};

const tryPathsAny = (obj, paths = []) => {
  for (const p of paths) {
    if (!obj) continue;
    const parts = p.split('.');
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (cur === undefined || cur === null || !(part in cur)) { ok = false; break; }
      cur = cur[part];
    }
    if (ok && cur !== undefined) return cur;
  }
  return undefined;
};

const sumArrayField = (arr, fieldCandidates = []) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  for (const field of fieldCandidates) {
    const allHave = arr.every(item => item && (field in item) && !Number.isNaN(Number(item[field])));
    if (allHave) return arr.reduce((s, it) => s + Number(it[field] || 0), 0);
  }
  // fallback: try to sum any numeric top-level values
  const numericValues = arr.map(item => {
    if (item == null) return 0;
    if (typeof item === 'number') return item;
    // try first numeric prop
    const keys = Object.keys(item);
    for (const k of keys) {
      if (!Number.isNaN(Number(item[k]))) return Number(item[k]);
    }
    return 0;
  });
  return numericValues.reduce((a,b) => a+b, 0);
};

/**
 * Formata dinamicamente o rawData em formato que o Dashboard espera.
 * Tentamos várias combinações de nomes (camelCase, snake_case, agregados).
 */
function formatDashboardData(raw) {
  if (!raw) return null;

  // POSSÍVEIS CAMINHOS (ordem de preferência)
  const totalLeads = tryPathsNumber(raw, [
    'globalSummary.totalLeads',
    'global_summary.total_leads',
    'totalLeads',
    'total_leads',
    'totalLeadsHistory.total',
    'totals.leads',
    'summary.totalLeads',
    'summary.total_leads'
  ]) || sumArrayField(tryPathsAny(raw, ['totalLeadsHistory', 'total_leads_history', 'leads_history']) || [], ['total', 'count', 'value']);

  const totalWonValueKW = tryPathsNumber(raw, [
    'globalSummary.totalWonValueKW',
    'totalWonValueKW',
    'total_won_value_kw',
    'totalKwHistory.totalKw',
    'totalKw',
    'totals.kw',
    'summary.totalKw'
  ]) || sumArrayField(tryPathsAny(raw, ['totalKwHistory', 'total_kw_history', 'kw_history']) || [], ['totalKw','kw','value']);

  const conversionRate = tryPathsNumber(raw, [
    'globalSummary.conversionRate',
    'conversionRate',
    'conversion_rate',
    'conversionRateHistory.rate',
    'summary.conversionRate'
  ]) || 0;

  const avgClosingTimeDays = tryPathsNumber(raw, [
    'globalSummary.avgClosingTimeDays',
    'avgClosingTimeDays',
    'avg_closing_time_days',
    'avgClosingTime',
    'avgClosingTimeHistory.avgDays',
    'summary.avgClosingTime'
  ]) || 0;

    // NOVOS CAMPOS — KPIs DE TEMPO MÉDIO (backend já envia)
  const tempoMedioFechamentoHoras = tryPathsNumber(raw, [
    'globalSummary.tempoMedioFechamentoHoras',
    'tempoMedioFechamentoHoras',
    'tempo_medio_fechamento_horas'
  ]) || 0;

  const tempoMedioAtendimentoHoras = tryPathsNumber(raw, [
    'globalSummary.tempoMedioAtendimentoHoras',
    'tempoMedioAtendimentoHoras',
    'tempo_medio_atendimento_horas'
  ]) || 0;


  // Productivity: pode vir em varias chaves
  const productivityCandidates = tryPathsAny(raw, [
    'productivity',
    'productivityBySeller',
    'productivity_by_seller',
    'sellersProductivity',
    'sellers'
  ]) || [];

  // Normalize sellers list
  const sellers = Array.isArray(productivityCandidates) ? productivityCandidates : (productivityCandidates?.sellers || []);

  const productivity = {
    sellers: sellers,
    totalLeads,
    totalWonValueKW
  };

  // Daily activity
  const dailyActivity = tryPathsAny(raw, [
    'dailyActivity',
    'activityDaily',
    'activity_daily',
    'activity',
    'chart.daily'
  ]) || [];

  // Lost reasons
  const lostReasons = tryPathsAny(raw, [
    'lostReasons',
    'lossReasons',
    'lost_reasons',
    'reasonsLost',
    'reasons_lost'
  ]) || [];

  // Filters
  const filters = tryPathsAny(raw, [
    'filters',
    'meta.filters',
    'query.filters'
  ]) || {};

  // If the raw object already looks like the formatted shape, prefer it
  const looksLikeFormatted = raw.globalSummary || raw.productivity || raw.dailyActivity || raw.lostReasons;
  if (looksLikeFormatted) {
    return {
      globalSummary: raw.globalSummary || {
        totalLeads, totalWonValueKW, conversionRate, avgClosingTimeDays
      },
      productivity: raw.productivity || productivity,
      dailyActivity: raw.dailyActivity || dailyActivity,
      lostReasons: raw.lostReasons || lostReasons,
      filters: raw.filters || filters
    };
  }

  // fallback: try to detect fields inside raw.data
  const inner = raw.data || raw;

  return {
    globalSummary: {
      totalLeads,
      totalWonValueKW,
      conversionRate,
      avgClosingTimeDays
    },
    productivity,
    dailyActivity,
    lostReasons,
    filters
  };
}

/* ============================================================================ */
/* HOOK PRINCIPAL                                                              */
/* ============================================================================ */

export function useReports(initialFilters = {}) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [exporting, setExporting] = useState(false);

  const [analyticNotes, setAnalyticNotes] = useState(null);
  const [analyticLoading, setAnalyticLoading] = useState(false);
  const [analyticError, setAnalyticError] = useState(null);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      if (typeof key === 'object') return { ...prev, ...key };
      return { ...prev, [key]: value };
    });
  }, []);

  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchDashboardMetrics(filters);
      // Se a API já retornou o formato correto, use direto
      if (!raw) {
        setData(null);
      } else {
        const formatted = formatDashboardData(raw);
        setData(formatted);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Falha ao carregar dados do relatório.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    fetchDashboardData(filters);
    setAnalyticNotes(null);
  }, [filters, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalyticNotes = useCallback(async ({ leadId = null, stage = null }) => {
    if (!leadId && !stage) return;
    setAnalyticLoading(true);
    setAnalyticError(null);
    setAnalyticNotes(null);
    try {
      const resp = await fetchAnalyticNotesAPI(leadId, stage);
      setAnalyticNotes(resp);
    } catch (err) {
      console.error('Erro ao buscar notas analíticas:', err);
      setAnalyticError('Erro ao carregar o relatório de atendimento.');
    } finally {
      setAnalyticLoading(false);
    }
  }, []);

  const clearAnalyticNotes = useCallback(() => setAnalyticNotes(null), []);

  const exportFile = useCallback(async (format) => {
    setExporting(true);
    setError(null);
    try {
      if (format === 'csv') await downloadCsvReport(filters);
      else if (format === 'pdf') await downloadPdfReport(filters);
      else throw new Error('Formato desconhecido');
    } catch (err) {
      console.error(`Erro ao exportar ${format}:`, err);
      setError(`Erro ao exportar ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const exportToCsv = () => exportFile('csv');
  const exportToPdf = () => exportFile('pdf');

  return {
    data,
    filters,
    loading,
    error,
    updateFilter,
    applyFilters,
    exporting,
    exportToCsv,
    exportToPdf,
    analyticNotes,
    analyticLoading,
    analyticError,
    fetchAnalyticNotes,
    clearAnalyticNotes
  };
}
