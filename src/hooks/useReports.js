// src/hooks/useReports.js

import { useState, useEffect, useCallback } from 'react';
// Serviço que faz as requisições ao backend (já existe no seu projeto)
import {
  fetchDashboardMetrics,
  downloadCsvReport,
  downloadPdfReport
} from '../services/ReportService';

/**
 * useReports
 * Hook para gerenciar filtros, carregamento e exportação do relatório.
 *
 * Correções principais:
 * - updateFilter aceita tanto (key, value) quanto um objeto patch: updateFilter({startDate: '2025-..'})
 * - Normaliza filtros antes de enviar para o backend (vendorId -> ownerId)
 * - Garantia de usar filtros atuais em exportações
 */
export function useReports(initialFilters = {}) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Normaliza o shape de filtros que o backend espera
  const normalizeFilters = useCallback((rawFilters = {}) => {
    // rawFilters pode vir com vendorId (frontend) ou ownerId
    const nf = {
      startDate: rawFilters.startDate || null,
      endDate: rawFilters.endDate || null,
      source: rawFilters.source || rawFilters.source || 'all',
      // backend espera ownerId; frontend usa vendorId — prioriza ownerId se existir
      ownerId: rawFilters.ownerId ?? rawFilters.vendorId ?? 'all'
    };
    return nf;
  }, []);

  // Função que busca as métricas — aceita um objeto de filtros (raw)
  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const normalized = normalizeFilters(currentFilters || filters);
      // Chama o serviço que faz a requisição ao backend (POST/GET dependendo da implementação)
      const metricsData = await fetchDashboardMetrics(normalized);

      // Espera-se que fetchDashboardMetrics retorne o objeto já na forma utilizada pelo frontend,
      // Ex.: { productivity: {...}, conversionBySource: [...] }
      setData(metricsData);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Falha ao carregar dados do relatório. Tente novamente.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, normalizeFilters]);

  // updateFilter: aceita (key, value) ou (patchObject)
  const updateFilter = useCallback((a, b) => {
    if (typeof a === 'object' && a !== null) {
      // merge patch
      setFilters(prev => ({ ...prev, ...a }));
    } else if (typeof a === 'string') {
      setFilters(prev => ({ ...prev, [a]: b }));
    } else {
      console.warn('updateFilter recebeu formato inválido:', a, b);
    }
  }, []);

  // Aplica filtros (chama a busca com os filtros atuais)
  const applyFilters = useCallback(() => {
    fetchDashboardData(filters);
  }, [fetchDashboardData, filters]);

  // Exportação (CSV/PDF) — sempre normaliza filtros antes de enviar
  const exportFile = useCallback(async (format) => {
    setExporting(true);
    setError(null);
    try {
      const normalized = normalizeFilters(filters);
      if (format === 'csv') {
        await downloadCsvReport(normalized);
      } else if (format === 'pdf') {
        await downloadPdfReport(normalized);
      } else {
        throw new Error('Formato de exportação desconhecido.');
      }
    } catch (err) {
      console.error('Erro na exportação:', err);
      setError(`Erro ao exportar para ${String(format).toUpperCase()}.`);
    } finally {
      setExporting(false);
    }
  }, [filters, normalizeFilters]);

  const exportToCsv = useCallback(() => exportFile('csv'), [exportFile]);
  const exportToPdf = useCallback(() => exportFile('pdf'), [exportFile]);

  // Carrega os dados na montagem com os filtros iniciais (normalizados internamente)
  useEffect(() => {
    // inicializa filtros no estado (merge com initialFilters)
    setFilters(prev => ({ ...(prev || {}), ...(initialFilters || {}) }));
    // busca com initialFilters
    fetchDashboardData(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]); // note: fetchDashboardData depende de filters, mas queremos rodar só no mount com initialFilters

  return {
    data,
    filters,
    loading,
    error,
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
  };
}
