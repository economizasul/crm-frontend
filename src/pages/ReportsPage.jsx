// src/pages/ReportsPage.jsx (ATUALIZADO para usar exportações)

import React, { useState } from 'react';
import { useReports } from '../hooks/useReports';
// ... (outros imports)

// ... (MOCK_VENDORS e MOCK_SOURCES)

function ReportsPage() {
    const [currentFilters, setCurrentFilters] = useState({});
    
    const { 
        data, 
        loading, 
        error, 
        updateFilter, 
        applyFilters,
        filters,
        exporting, // NOVO: Estado de exportação
        exportToCsv, // NOVO: Função de exportação CSV
        exportToPdf  // NOVO: Função de exportação PDF
    } = useReports(currentFilters);

    // ... (handleFilterChange e handleApply permanecem os mesmos)
    const handleFilterChange = (e) => {
        updateFilter(e.target.name, e.target.value);
    };

    const handleApply = (e) => {
        e.preventDefault();
        setCurrentFilters(filters);
        applyFilters();
    };


    return (
        <div className="flex h-screen bg-gray-100">
            {/* ... (Sidebar e main) */}
            <main className="flex-1 overflow-y-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Relatórios e Métricas</h1>

                {/* --- Área de Filtros e Exportação (Top Bar) --- */}
                <form onSubmit={handleApply} className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
                    
                    {/* ... (Filtros de Período, Vendedor, Origem) */}

                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150" disabled={loading}>
                        Aplicar Filtros
                    </button>
                    
                    {/* Botões de Exportação */}
                    <div className="ml-auto flex space-x-2">
                        <button 
                            type="button" 
                            onClick={exportToCsv}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                            disabled={exporting || loading} // Desabilita se estiver carregando ou exportando
                        >
                            {exporting ? 'Exportando CSV...' : 'Exportar CSV'}
                        </button>
                        <button 
                            type="button" 
                            onClick={exportToPdf}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                            disabled={exporting || loading}
                        >
                            {exporting ? 'Gerando PDF...' : 'Gerar Relatório PDF'}
                        </button>
                    </div>
                </form>

                {/* --- Conteúdo Principal do Dashboard --- */}
                {/* ... (Loading/Error logic) */}
                {data && (
                    <ReportsDashboard data={data} filters={filters} />
                )}
            </main>
        </div>
    );
}

export default ReportsPage;