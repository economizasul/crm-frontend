// src/hooks/useReports.js
import { useState, useEffect, useCallback } from 'react';
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

  // Atualiza um ou mais filtros
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (typeof key === 'object') return { ...prev, ...key };
      return { ...prev, [key]: value };
    });
  }, []);

  // Busca dados do dashboard
  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const metricsData = await fetchDashboardMetrics(currentFilters);
      setData(metricsData);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Falha ao carregar dados do relatório. Tente novamente.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplica os filtros manualmente (botão)
  const applyFilters = useCallback(() => {
    fetchDashboardData(filters);
  }, [filters, fetchDashboardData]);

  // Exportações
  const exportFile = useCallback(async (format) => {
    setExporting(true);
    setError(null);
    try {
      if (format === 'csv') await downloadCsvReport(filters);
      else if (format === 'pdf') await downloadPdfReport(filters);
      else throw new Error('Formato desconhecido');
    } catch (err) {
      console.error(`Erro na exportação ${format}:`, err);
      setError(`Erro ao exportar para ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const exportToCsv = () => exportFile('csv');
  const exportToPdf = () => exportFile('pdf');

  // Carrega relatório inicial (dia atual)
  useEffect(() => {
    fetchDashboardData(initialFilters);
  }, [fetchDashboardData]);

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
