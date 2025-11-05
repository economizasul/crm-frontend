// src/pages/ReportsPage.jsx

import React from 'react';
import { useReports } from '../hooks/useReports'; 
// ⭐️ CORREÇÃO AQUI: Caminho para o componente ReportsDashboard
import ReportsDashboard from '../components/reports/ReportsDashboard'; 
import FilterBar from '../components/FilterBar'; 

// Filtros iniciais
const initialFilters = { 
    startDate: '2024-01-01', 
    endDate: '2024-12-31', 
    vendorId: 'all', 
    source: 'all' 
};

function ReportsPage() {
    const {
        data: metrics, 
        filters,
        loading,
        error,
        exporting,
        updateFilter,
        applyFilters,
        exportToCsv,
        exportToPdf,
    } = useReports(initialFilters);
    
    if (loading && !metrics) {
        return <div className="p-8 text-center text-xl text-indigo-600">Carregando Dashboard...</div>;
    }
    
    if (error) {
        return <div className="p-8 text-center text-xl text-red-600">Erro: {error}</div>;
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard de Relatórios</h1>
            
            <FilterBar 
                currentFilters={filters}
                onFilterChange={updateFilter} 
                onApplyFilters={applyFilters} 
                exportToCsv={exportToCsv}     
                exportToPdf={exportToPdf}     
                isExporting={exporting}
                isLoading={loading}
            />
            
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