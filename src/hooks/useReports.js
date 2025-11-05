// src/hooks/useReports.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext'; // ⭐️ Importação CRÍTICA
import { 
    fetchDashboardMetrics, 
    downloadCsvReport, 
    downloadPdfReport 
} from '../services/ReportService'; // ⭐️ Importação CRÍTICA

// Filtros iniciais padrão para qualquer relatório
const initialDefaultFilters = { 
    ownerId: 'all', 
    status: 'all',
    startDate: '', 
    endDate: '' 
};

/**
 * Hook customizado para gerenciar a lógica de busca e estado dos relatórios.
 * @param {Object} initialFilters - Filtros iniciais.
 */
export function useReports(initialFilters = {}) {
    // Mescla filtros iniciais com os padrões
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({ ...initialDefaultFilters, ...initialFilters });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    
    // Obtém o usuário logado para passar as permissões para o backend
    const { user } = useAuth();
    // ⭐️ Contexto de Autenticação
    const authContext = { userId: user ? user.id : null, isAdmin: user ? user.role === 'Admin' : false };


    // 1. FUNÇÃO DE BUSCA DE DADOS
    const fetchDashboardData = useCallback(async (currentFilters) => {
        // Não busca se o user ID ainda não está disponível
        if (!authContext.userId) return; 

        setLoading(true);
        setError(null);
        try {
            // Chama o serviço, passando os filtros e o contexto de autenticação
            const metrics = await fetchDashboardMetrics(currentFilters, authContext);
            
            setData(metrics); 
            
        } catch (err) {
            console.error("Erro ao buscar dados do dashboard:", err);
            setError(err.response?.data?.message || 'Falha ao carregar métricas.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [authContext.userId, authContext.isAdmin]); 


    // 2. FUNÇÕES DE EXPORTAÇÃO
    const exportFile = useCallback(async (format) => {
        setExporting(true);
        setError(null);
        try {
            let response;
            
            if (format === 'csv') {
                response = await downloadCsvReport(filters);
            } else if (format === 'pdf') {
                response = await downloadPdfReport(filters);
            } else {
                throw new Error("Formato de exportação inválido.");
            }

            // Lógica de download (manter a lógica robusta de blob/header)
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `relatorio_${format}.${format}`;
            if (contentDisposition) {
                 // Regex para extrair o nome do arquivo, ajustado para ser mais flexível
                 const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;"]+)/i);
                 if (match && match.length > 1) {
                    fileName = decodeURIComponent(match[1]); // Decodifica caracteres especiais (como espaços)
                 }
            }
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error('Erro na exportação:', err);
            setError(`Erro ao exportar para ${format.toUpperCase()}.`);
        } finally {
            setExporting(false);
        }
    }, [filters]);
    
    // 3. APLICAÇÃO E ATUALIZAÇÃO DE FILTROS
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const applyFilters = () => {
        // Força a busca dos dados com os filtros atuais
        fetchDashboardData(filters);
    };
    
    // Funções públicas de exportação
    const exportToCsv = () => exportFile('csv');
    const exportToPdf = () => exportFile('pdf');
    
    // Efeito colateral que dispara a primeira busca de dados
    useEffect(() => {
        // ⭐️ CRÍTICO: Dispara a busca quando o user ID estiver pronto
        if (authContext.userId) {
            fetchDashboardData(filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext.userId]); 


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