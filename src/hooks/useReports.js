// src/hooks/useReports.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Assumindo que você usa axios

const API_BASE_URL = '/api/reports'; // Ajuste conforme a URL base da sua API

/**
 * Hook customizado para gerenciar a lógica de busca e estado dos relatórios.
 * @param {Object} initialFilters - Filtros iniciais.
 */
export function useReports(initialFilters = {}) {
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Função para construir a string de query com base nos filtros
    const buildQueryString = (currentFilters) => {
        return Object.keys(currentFilters)
            .filter(key => currentFilters[key]) // Remove filtros vazios
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(currentFilters[key])}`)
            .join('&');
    };

    const fetchDashboardData = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);
        try {
            const queryString = buildQueryString(currentFilters);
            
            // Requisição GET para o endpoint que criamos: /api/reports/data
            const response = await axios.get(`${API_BASE_URL}/data?${queryString}`);
            
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError(response.data.message || 'Falha ao carregar dados do relatório.');
            }
        } catch (err) {
            console.error('Erro na requisição dos relatórios:', err);
            setError('Erro de conexão ou servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Função para atualizar um único filtro
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);
    
    // Função para aplicar os filtros e recarregar os dados
    const applyFilters = useCallback(() => {
        fetchDashboardData(filters);
    }, [filters, fetchDashboardData]);

    // Carrega os dados na montagem do componente (com filtros iniciais)
    useEffect(() => {
        fetchDashboardData(filters);
    }, [fetchDashboardData]); 

    return {
        data,
        filters,
        loading,
        error,
        updateFilter,
        applyFilters,
        fetchDashboardData // Pode ser útil para refrescar dados
    };
}