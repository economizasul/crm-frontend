// src/hooks/useReports.js (Reescrito para a nova estrutura de dados)
import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardMetrics,
  downloadCsvReport,
  downloadPdfReport,
  fetchAnalyticNotes as fetchAnalyticNotesAPI
} from '../services/ReportService'; // Assumindo que você criou 'fetchAnalyticNotes'

export function useReports(initialFilters = {}) {
  // Estado dos dados do Dashboard (Métricas)
  const [data, setData] = useState(null); 
  // Estado dos Filtros
  const [filters, setFilters] = useState(initialFilters);
  
  // Estado de Carregamento e Erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Estado para o NOVO Relatório Analítico de Atendimento
  const [analyticNotes, setAnalyticNotes] = useState(null);
  const [analyticLoading, setAnalyticLoading] = useState(false);
  const [analyticError, setAnalyticError] = useState(null);
  
  // --- Lógica de Filtros e Busca Principal ---

  // Atualiza um ou mais filtros
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (typeof key === 'object') return { ...prev, ...key };
      return { ...prev, [key]: value };
    });
  }, []);

  // Busca dados do dashboard (função principal que chama a API)
  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // 🚨 MUDANÇA CHAVE: O ReportDataService agora retorna um objeto com todas as métricas
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

  // Aplica os filtros manualmente (botão 'Aplicar Filtros')
  const applyFilters = useCallback(() => {
    fetchDashboardData(filters);
    // Limpa o relatório analítico ao aplicar novos filtros no dashboard
    setAnalyticNotes(null);
  }, [filters, fetchDashboardData]);

  // Carrega relatório inicial (no primeiro carregamento)
  useEffect(() => {
    // Busca dados iniciais ao montar o componente
    fetchDashboardData(initialFilters);
  }, [fetchDashboardData]); 

  // --- Lógica do Relatório Analítico de Atendimento ---

  const fetchAnalyticNotes = useCallback(async ({ leadId = null, stage = null }) => {
    if (!leadId && !stage) return; // Nada para buscar

    setAnalyticLoading(true);
    setAnalyticError(null);
    setAnalyticNotes(null);
    
    try {
      // Chama a nova rota de API
      const data = await fetchAnalyticNotesAPI(leadId, stage);
      setAnalyticNotes(data);
    } catch (err) {
      console.error('Erro ao buscar notas analíticas:', err);
      setAnalyticError(`Erro ao carregar o relatório de atendimento. ${err.message}`);
    } finally {
      setAnalyticLoading(false);
    }
  }, []);

  // --- Lógica de Exportação ---

  const exportFile = useCallback(async (format) => {
    setExporting(true);
    setError(null);
    try {
      if (format === 'csv') await downloadCsvReport(filters);
      else if (format === 'pdf') await downloadPdfReport(filters);
      else throw new Error('Formato desconhecido');
    } catch (err) {
      console.error(`Erro na exportação ${format}:`, err);
      // Aqui você pode melhorar a mensagem de erro para o usuário final.
      setError(`Erro ao exportar para ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  }, [filters]);

  const exportToCsv = () => exportFile('csv');
  const exportToPdf = () => exportFile('pdf');

  // --- Retorno do Hook ---

  return {
    // Dashboard Principal
    data,
    filters,
    loading,
    error,
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
    
    // Relatório Analítico de Atendimento
    analyticNotes,
    analyticLoading,
    analyticError,
    fetchAnalyticNotes, // Função para ser chamada pelos componentes do dashboard
  };
}