// src/hooks/useReports.js
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboardMetrics,
  downloadCsvReport,
  downloadPdfReport
} from '../services/ReportService';

export function useReports(initialFilters = {}) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // guarda a referência do último filtro para evitar problemas de closure
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // currentFilters pode ser undefined -> usar os filtros atuais
      const f = currentFilters || filtersRef.current || initialFilters;
      // chama o serviço que faz a requisição para o backend
      const metricsData = await fetchDashboardMetrics(f);
      // espera-se que fetchDashboardMetrics retorne o objeto de métricas (já em formato utilizável)
      setData(metricsData);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Falha ao carregar dados do relatório. Tente novamente.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  // updateFilter agora aceita:
  // - updateFilter('startDate', '2024-01-01')
  // - updateFilter({ startDate: '2024-01-01', vendorId: '2' })
  // - updateFilter('vendorId', null) etc.
  const updateFilter = useCallback((a, b) => {
    if (a && typeof a === 'object' && !Array.isArray(a)) {
      // merge object
      setFilters(prev => ({ ...prev, ...a }));
    } else if (typeof a === 'string') {
      setFilters(prev => ({ ...prev, [a]: b }));
    } else {
      console.warn('updateFilter chamada com parâmetros inválidos:', a, b);
    }
  }, []);

  const applyFilters = useCallback(() => {
    fetchDashboardData(filtersRef.current);
  }, [fetchDashboardData]);

  const exportFile = useCallback(async (format) => {
    setExporting(true);
    setError(null);
    try {
      const f = filtersRef.current || initialFilters;
      if (format === 'csv') {
        await downloadCsvReport(f);
      } else if (format === 'pdf') {
        await downloadPdfReport(f);
      } else {
        throw new Error('Formato de exportação desconhecido.');
      }
    } catch (err) {
      console.error('Erro na exportação:', err);
      setError(`Erro ao exportar para ${String(format).toUpperCase()}.`);
    } finally {
      setExporting(false);
    }
  }, [initialFilters]);

  const exportToCsv = useCallback(() => exportFile('csv'), [exportFile]);
  const exportToPdf = useCallback(() => exportFile('pdf'), [exportFile]);

  // Carrega os dados na montagem (faz a primeira busca)
  useEffect(() => {
    // inicializa filtros com initialFilters e faz primeira busca
    setFilters(initialFilters);
    fetchDashboardData(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // rodar só na montagem

  return {
    data,
    filters,
    loading,
    error,
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf
  };
}
