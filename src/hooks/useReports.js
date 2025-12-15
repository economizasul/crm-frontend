// src/hooks/useReports.js
import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardMetrics,
  fetchFilteredReport,
  fetchLossReasons,
  downloadCsvReport,
  downloadPdfReport,
  fetchAnalyticNotes as fetchAnalyticNotesAPI
} from '../services/ReportService';

/* --- helpers idênticos aos anteriores, mantive para segurança --- */
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
  const numericValues = arr.map(item => {
    if (item == null) return 0;
    if (typeof item === 'number') return item;
    const keys = Object.keys(item);
    for (const k of keys) {
      if (!Number.isNaN(Number(item[k]))) return Number(item[k]);
    }
    return 0;
  });
  return numericValues.reduce((a,b) => a+b, 0);
};

/* --- detecções de origin / funnel reforçadas --- */
function detectOriginStats(raw) {
  const originCandidates = tryPathsAny(raw, [
    'originStats',
    'origin_stats',
    'sources',
    'leadOrigins',
    'origins',
    'origem',
    'origems'
  ]);
  if (originCandidates && typeof originCandidates === 'object' && !Array.isArray(originCandidates)) {
    return originCandidates;
  }

  const arrayCandidates = tryPathsAny(raw, [
    'originList',
    'origin_list',
    'originsList',
    'leadOriginsList',
    'sourcesList'
  ]);
  if (Array.isArray(arrayCandidates)) {
    const obj = {};
    arrayCandidates.forEach(it => {
      const key = it.field || it.label || it.source || it.name || it.origin || it._id || it.id;
      const value = Number(it.value ?? it.count ?? it.total ?? it.qty ?? 0);
      if (key) obj[key] = value;
    });
    return obj;
  }
  return null;
}

function detectFunnelStages(raw) {
  const funnelArr = tryPathsAny(raw, [
    'funnel',
    'funnelStages',
    'stages',
    'pipeline',
    'pipelineStages',
    'stages_list',
    'funnels'
  ]);
  if (Array.isArray(funnelArr) && funnelArr.length > 0) {
    return funnelArr.map(item => {
      if (!item) return null;
      const stageName = item.stageName || item.stage || item.name || item.label || item.stage_name || item.nome || item.stage_title || item.title;
      const count = Number(item.count ?? item.value ?? item.total ?? item.qty ?? 0);
      return { stageName: stageName || 'Outros', count: Number(count || 0) };
    }).filter(Boolean);
  }

  const funnelObj = tryPathsAny(raw, ['funnelObj', 'funnel_object', 'stagesObj']);
  if (funnelObj && typeof funnelObj === 'object' && !Array.isArray(funnelObj)) {
    return Object.keys(funnelObj).map(k => ({ stageName: k, count: Number(funnelObj[k] || 0) }));
  }

  return null;
}

/* --- função principal de format --- */
function formatDashboardData(raw) {
  if (!raw) return null;

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
    'totalWonValue',
    'totalKw',
    'totals.kw',
    'summary.totalKw'
  ]) || sumArrayField(tryPathsAny(raw, ['leads', 'wonLeads', 'ganhos']) || [], ['avg_consumption', 'potencia_kw', 'kw']);

  const conversionRate = tryPathsNumber(raw, [
    'globalSummary.conversionRate',
    'conversionRate',
    'conversion_rate',
    'summary.conversionRate'
  ]) || 0;

  const avgClosingTimeDays = tryPathsNumber(raw, [
    'globalSummary.avgClosingTimeDays',
    'avgClosingTimeDays',
    'avg_closing_time_days'
  ]) || 0;

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

  const productivityCandidates = tryPathsAny(raw, [
    'productivity',
    'productivityBySeller',
    'productivity_by_seller',
    'sellersProductivity',
    'sellers'
  ]) || [];

  const sellers = Array.isArray(productivityCandidates) ? productivityCandidates : (productivityCandidates?.sellers || []);

  const productivity = {
    sellers: sellers,
    totalLeads,
    totalWonValueKW
  };

  const dailyActivity = tryPathsAny(raw, [
    'dailyActivity',
    'activityDaily',
    'activity_daily',
    'activity',
    'chart.daily'
  ]) || [];

  const lostReasons = tryPathsAny(raw, ['lostReasons', 'lost_reasons', 'reasonsLost']) || { reasons: [], totalLost: 0 };

  const filters = tryPathsAny(raw, [
    'filters',
    'meta.filters',
    'query.filters'
  ]) || {};

  // Detect originStats and funnelStages robustly
  const originStats = detectOriginStats(raw) || {};
  const funnelStages = detectFunnelStages(raw) || [];

  const looksLikeFormatted = raw.globalSummary || raw.productivity || raw.dailyActivity || raw.lostReasons;
  if (looksLikeFormatted) {
    return {
      globalSummary: raw.globalSummary || {
        totalLeads, totalWonValueKW, conversionRate, avgClosingTimeDays
      },
      productivity: raw.productivity || productivity,
      dailyActivity: raw.dailyActivity || dailyActivity,
      lostReasons: raw.lostReasons || lostReasons,
      filters: raw.filters || filters,
      originStats: raw.originStats || originStats,
      funnel: raw.funnel || funnelStages
    };
  }

  const inner = raw.data || raw;

  return {
    globalSummary: {
      totalLeads,
      totalWonValueKW,
      conversionRate,
      avgClosingTimeDays,
      tempoMedioFechamentoHoras,
      tempoMedioAtendimentoHoras
    },
    productivity,
    dailyActivity,
    lostReasons,
    filters,
    originStats,
    funnel: funnelStages
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

  const [lostReasonsData, setLostReasonsData] = useState({ reasons: [], totalLost: 0 });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      if (typeof key === 'object') return { ...prev, ...key };
      return { ...prev, [key]: value };
    });
  }, []);

  // fetchDashboardData aceita currentFilters pra evitar problemas com closures
const fetchDashboardData = useCallback(async (currentFilters = {}) => {
  setLoading(true);
  setError(null);
  try {
    const raw = await fetchFilteredReport(currentFilters || filters);

    if (!raw) {
      setData(null);
      setLostReasonsData({ reasons: [], totalLost: 0 });
    } else {
      const formatted = formatDashboardData(raw);
      setData(formatted);

      // CARREGA MOTIVOS DE PERDA SEPARADAMENTE
      try {
        const lossRaw = await fetchLossReasons(currentFilters || filters);
        setLostReasonsData(lossRaw || { reasons: [], totalLost: 0 });
      } catch (lossErr) {
        console.error('Erro ao carregar motivos de perda:', lossErr);
        setLostReasonsData({ reasons: [], totalLost: 0 });
      }
    }
  } catch (err) {
    console.error('Erro ao buscar dados do dashboard:', err);
    setError('Falha ao carregar dados do relatório.');
    setData(null);
    setLostReasonsData({ reasons: [], totalLost: 0 });
  } finally {
    setLoading(false);
  }
}, [filters]);

  const applyFilters = useCallback(() => {
    fetchDashboardData(filters);
    setAnalyticNotes(null);
  }, [filters, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData(filters);
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
    clearAnalyticNotes,
    lostReasonsData,
    fetchDashboardData
  };
}
