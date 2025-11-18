// src/hooks/useReports.js
import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardMetrics,
  downloadCsvReport,
  downloadPdfReport,
  fetchAnalyticNotes as fetchAnalyticNotesAPI
} from '../services/ReportService';

/* ============================================================================
   FUNÇÃO DE FORMATAÇÃO – adapta os dados crus da API
   ============================================================================ */

function formatDashboardData(raw) {
  if (!raw) return null;

  return {
    /* RESUMO GLOBAL (cards superiores) */
    globalSummary: {
      totalLeads: raw.totalLeadsHistory?.total || 0,
      totalWonValueKW: raw.totalKwHistory?.totalKw || 0,
      conversionRate: raw.conversionRateHistory?.rate || 0,
      avgClosingTimeDays: raw.avgClosingTimeHistory?.avgDays || 0,
    },

    /* PRODUTIVIDADE POR VENDEDOR */
    productivity: {
      sellers: raw.productivityBySeller || [],
      totalLeads: raw.totalLeadsHistory?.total || 0,
      totalWonValueKW: raw.totalKwHistory?.totalKw || 0,
    },

    /* ATIVIDADE DIÁRIA */
    dailyActivity: raw.activityDaily || [],

    /* MOTIVOS DE PERDA */
    lostReasons: raw.lostReasons || [],

    /* FILTROS RETORNADOS PELA API */
    filters: raw.filters || {},
  };
}

/* ============================================================================
   HOOK PRINCIPAL
   ============================================================================ */

export function useReports(initialFilters = {}) {

  // Dashboard
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Exportação
  const [exporting, setExporting] = useState(false);

  // Relatório Analítico de Atendimento
  const [analyticNotes, setAnalyticNotes] = useState(null);
  const [analyticLoading, setAnalyticLoading] = useState(false);
  const [analyticError, setAnalyticError] = useState(null);

  /* ============================================================================
     Atualiza filtros
     ============================================================================ */

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (typeof key === 'object') return { ...prev, ...key };
      return { ...prev, [key]: value };
    });
  }, []);

  /* ============================================================================
     Carrega dados principais do Dashboard
     ============================================================================ */

  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      const rawData = await fetchDashboardMetrics(currentFilters);

      const formatted = formatDashboardData(rawData);

      setData(formatted);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Falha ao carregar dados do relatório.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================================================================
     Botão Aplicar Filtros
     ============================================================================ */

  const applyFilters = useCallback(() => {
    fetchDashboardData(filters);
    setAnalyticNotes(null);
  }, [filters, fetchDashboardData]);

  /* ============================================================================
     Carregamento inicial
     ============================================================================ */

  useEffect(() => {
    fetchDashboardData(initialFilters);
  }, [fetchDashboardData]);

  /* ============================================================================
     RELATÓRIO ANALÍTICO DE ATENDIMENTO (Modal / Offcanvas)
     ============================================================================ */

  const fetchAnalyticNotes = useCallback(async ({ leadId = null, stage = null }) => {
    if (!leadId && !stage) return;

    setAnalyticLoading(true);
    setAnalyticError(null);
    setAnalyticNotes(null);

    try {
      const data = await fetchAnalyticNotesAPI(leadId, stage);
      setAnalyticNotes(data);
    } catch (err) {
      console.error('Erro ao buscar notas analíticas:', err);
      setAnalyticError('Erro ao carregar o relatório de atendimento.');
    } finally {
      setAnalyticLoading(false);
    }
  }, []);

  const clearAnalyticNotes = useCallback(() => {
    setAnalyticNotes(null);
  }, []);

  /* ============================================================================
     EXPORTAÇÕES (CSV / PDF)
     ============================================================================ */

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

  /* ============================================================================
     RETORNO DO HOOK
     ============================================================================ */

  return {
    // Dashboard
    data,
    filters,
    loading,
    error,

    // Ações
    updateFilter,
    applyFilters,

    // Exportações
    exporting,
    exportToCsv,
    exportToPdf,

    // Relatório Analítico
    analyticNotes,
    analyticLoading,
    analyticError,
    fetchAnalyticNotes,
    clearAnalyticNotes,
  };
}
