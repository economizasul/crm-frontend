// src/pages/ReportsPage.jsx

import React from 'react';
import { useReports } from '../hooks/useReports'; // Importa o hook customizado
import FilterBar from '../components/FilterBar.jsx'; 
import ReportsDashboard from '../components/reports/ReportsDashboard'; // Ajuste o caminho se necessário
import { FaChartBar } from 'react-icons/fa'; // Mantido para o ícone do título, se desejar


const initialFilters = { 
    startDate: new Date().toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0], // Data de hoje
    vendorId: 'all', 
    source: 'all' 
};

function ReportsPage() {
    // ⭐️ Desestrutura as variáveis e funções do hook useReports ⭐️
    const { 
        data,          // Objeto completo com métricas
        filters, 
        loading, 
        error, 
        exporting, 
        updateFilter, 
        applyFilters, 
        exportToCsv, 
        exportToPdf 
    } = useReports(initialFilters); 

    // A lógica de 'loading' e 'error' para a tela inteira pode ser simplificada aqui,
    // mas o ReportsDashboard já tem tratamento para os dados.

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Título Principal */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <FaChartBar className="mr-3 text-indigo-600"/>
                Dashboard de Relatórios
            </h1>
            
            {/* Barra de Filtros (FilterBar) */}
            <FilterBar 
                currentFilters={filters}
                onFilterChange={updateFilter} 
                onApplyFilters={applyFilters} 
                exportToCsv={exportToCsv}     
                exportToPdf={exportToPdf}     
                isExporting={exporting}
                isLoading={loading}
            />
            
            {/* Componente principal do Dashboard */}
            <div className="mt-6">
                <ReportsDashboard 
                    // ⭐️ CRÍTICO: Agora passa 'data' (do useReports) e não 'metrics' ⭐️
                    data={data} 
                    loading={loading}
                    error={error}
                />
            </div>
            
            {/* Mensagem se não houver dados *APÓS* o carregamento e sem erro */}
            {/* O ReportsDashboard também cuida disso, mas podemos deixar um fallback aqui se loading/error for false */}
            {!data && !loading && !error && (
                 <div className="mt-8 p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded-lg">
                    📊 Use a barra de filtros acima e clique em **Aplicar Filtros** para carregar o relatório.
                </div>
            )}

        </div>
    );
}

export default ReportsPage;