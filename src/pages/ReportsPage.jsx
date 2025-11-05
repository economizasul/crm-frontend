// src/pages/ReportsPage.jsx

import React from 'react';
// ⭐️ NOVIDADE: Importa o hook customizado
import { useReports } from '../hooks/useReports'; 
import ReportsDashboard from '../components/ReportsDashboard'; 
import FilterBar from '../components/FilterBar'; // ⭐️ ASSUMIDO: Adicionando componente de Filtros para uso

// Filtros iniciais
const initialFilters = { 
    startDate: '2024-01-01', 
    endDate: '2024-12-31', 
    vendorId: 'all', 
    source: 'all' 
};

function ReportsPage() {
    // ⭐️ SUBSTITUIÇÃO COMPLETA: Usando o hook useReports para gerenciar o estado
    const {
        data: metrics, // Renomeado 'data' para 'metrics' para manter a consistência com o Dashboard
        filters,
        loading,
        error,
        exporting,
        updateFilter,
        applyFilters,
        exportToCsv,
        exportToPdf,
    } = useReports(initialFilters);
    
    // Agora, a lógica de carregamento e erro é muito mais limpa
    if (loading && !metrics) {
        return <div className="p-8 text-center text-xl text-indigo-600">Carregando Dashboard...</div>;
    }
    
    if (error) {
        return <div className="p-8 text-center text-xl text-red-600">Erro: {error}</div>;
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard de Relatórios</h1>
            
            {/* Componente de Filtro (Assumindo que ele será criado para usar as funções) */}
            <FilterBar 
                currentFilters={filters}
                onFilterChange={updateFilter} // Atualiza o estado do filtro no hook
                onApplyFilters={applyFilters} // Dispara a nova busca de dados
                exportToCsv={exportToCsv}     // Função para exportar CSV
                exportToPdf={exportToPdf}     // Função para exportar PDF
                isExporting={exporting}
                isLoading={loading}
            />
            
            {/* O componente Dashboard recebe as métricas prontas */}
            {metrics ? (
                <ReportsDashboard 
                    metrics={metrics} 
                />
            ) : (
                <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                    Nenhum dado encontrado para os filtros selecionados.
                </div>
            )}
        </div>
    );
}

export default ReportsPage;