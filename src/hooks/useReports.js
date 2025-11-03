// src/hooks/useReports.js (ATUALIZADO com funções de Exportação)

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 

const API_BASE_URL = '/api/reports'; 

/**
 * Hook customizado para gerenciar a lógica de busca e estado dos relatórios.
 * @param {Object} initialFilters - Filtros iniciais.
 */
export function useReports(initialFilters = {}) {
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false); // Novo estado para exportação
    
    // Função para construir a string de query
    const buildQueryString = (currentFilters) => {
        return Object.keys(currentFilters)
            .filter(key => currentFilters[key])
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(currentFilters[key])}`)
            .join('&');
    };
    
    // ... (fetchDashboardData, updateFilter, applyFilters, useEffect permanecem os mesmos)
    // Eu vou apenas incluir a definição completa do fetchDashboardData aqui por clareza.
    const fetchDashboardData = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);
        try {
            const queryString = buildQueryString(currentFilters);
            const response = await axios.get(`${API_BASE_URL}/data?${queryString}`);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError(response.data.message || 'Falha ao carregar dados do relatório.');
            }
        } catch (err) {
            setError('Erro de conexão ou servidor ao carregar dados.');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- NOVAS FUNÇÕES DE EXPORTAÇÃO ---

    const exportFile = useCallback(async (format) => {
        setExporting(true);
        setError(null);
        try {
            const queryString = buildQueryString(filters);
            const url = `${API_BASE_URL}/export/${format}?${queryString}`;
            
            // Usamos responseType: 'blob' para lidar com o arquivo de forma binária
            const response = await axios.get(url, { responseType: 'blob' });
            
            if (response.status !== 200) {
                // Se o servidor retornar erro 500, precisaremos ler a mensagem de erro do blob
                 setError('Erro ao gerar o arquivo no servidor.');
                 return;
            }

            // Lógica para criar um link e simular o clique para download
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            // Nome do arquivo baseado no cabeçalho de resposta Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `relatorio.${format}`;
            if (contentDisposition) {
                 const match = contentDisposition.match(/filename="(.+)"/);
                 if (match.length > 1) {
                    fileName = match[1];
                 }
            }
            
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
    
    const exportToCsv = () => exportFile('csv');
    const exportToPdf = () => exportFile('pdf');
    
    // Carrega os dados na montagem do componente
    useEffect(() => {
        fetchDashboardData(filters);
    }, [fetchDashboardData]); 

    return {
        data,
        filters,
        loading,
        error,
        exporting, // Retorna o estado de exportação
        updateFilter,
        applyFilters,
        exportToCsv, // Novas funções
        exportToPdf
    };
}