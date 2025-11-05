// src/hooks/useReports.js

import { useState, useEffect, useCallback } from 'react';
// ⭐️ CORREÇÃO: Importa as funções do serviço em vez de axios e URLs hardcoded
import { 
    fetchDashboardMetrics, 
    downloadCsvReport, 
    downloadPdfReport 
} from '../services/ReportService'; 

/**
 * Hook customizado para gerenciar a lógica de busca e estado dos relatórios.
 * @param {Object} initialFilters - Filtros iniciais.
 */
export function useReports(initialFilters = {}) {
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false); 

    // A função buildQueryString foi removida, pois a lógica agora está no ReportService.

    // Função para buscar os dados do dashboard
    const fetchDashboardData = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);
        try {
            // ⭐️ USO DO NOVO SERVIÇO: Chama o serviço que faz o POST corretamente.
            const metricsData = await fetchDashboardMetrics(currentFilters);
            setData(metricsData);
            
        } catch (err) {
            console.error('Erro ao buscar dados do dashboard:', err);
            // Mensagem de erro padrão para o usuário
            setError('Falha ao carregar dados do relatório. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []); 

    // Atualiza um filtro específico
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Aplica os filtros (geralmente usado por um botão 'Aplicar')
    const applyFilters = () => {
        fetchDashboardData(filters);
    };

    // Lógica unificada para exportação
    const exportFile = useCallback(async (format) => {
        setExporting(true);
        setError(null);
        try {
            // ⭐️ USO DO NOVO SERVIÇO: O serviço agora lida com a requisição, blob e download.
            if (format === 'csv') {
                await downloadCsvReport(filters);
            } else if (format === 'pdf') {
                await downloadPdfReport(filters);
            } else {
                 throw new Error('Formato de exportação desconhecido.');
            }
        } catch (err) {
            console.error('Erro na exportação:', err);
            setError(`Erro ao exportar para ${format.toUpperCase()}.`);
        } finally {
            setExporting(false);
        }
    }, [filters]);
    
    // Funções wrapper para exportação
    const exportToCsv = () => exportFile('csv');
    const exportToPdf = () => exportFile('pdf');
    
    // Carrega os dados na montagem do componente (usando filtros iniciais)
    useEffect(() => {
        fetchDashboardData(initialFilters);
    }, [fetchDashboardData, initialFilters]); 

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