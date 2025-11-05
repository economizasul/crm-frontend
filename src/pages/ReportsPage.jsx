// src/pages/ReportsPage.jsx

import React from 'react';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../AuthContext';
import ProductivityTable from '../components/reports/ProductivityTable'; // Importar o componente
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaDownload } from 'react-icons/fa';

// O ReportsDashboard será o componente principal da página.
function ReportsPage() {
    const { user } = useAuth();
    
    // ⭐️ NOVO: Usa o hook personalizado para toda a lógica de estado e fetch
    const { 
        data, 
        filters, 
        loading, 
        error, 
        exporting, 
        updateFilter, 
        exportToCsv, 
        exportToPdf,
        applyFilters
    } = useReports();
    
    // Permissões
    const canSeeReports = user && (user.relatorios_proprios_only || user.relatorios_todos || user.role === 'Admin');
    const canSeeAllData = user && (user.relatorios_todos || user.role === 'Admin');

    if (!canSeeReports) {
        return <ErrorMessage message="Acesso Negado. Você não tem permissão para visualizar relatórios." />;
    }

    // Estado de carregamento inicial
    if (loading && !data) {
        return <LoadingSpinner message="Carregando Relatórios..." />;
    }
    
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Dashboard de Relatórios</h1>
            
            {/* Componentes de Filtro (Você deve criar o FilterComponent para usar updateFilter e applyFilters) */}
            <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-3">Filtros</h2>
                {/* Aqui você pode incluir: */}
                {/* <FilterComponent 
                    filters={filters} 
                    onFilterChange={updateFilter} 
                    onApply={applyFilters} 
                    canSeeAllData={canSeeAllData}
                /> */}
                <p className="text-sm text-gray-500">
                    {/* Exemplo de uso de filtros para o MVP: */}
                    Filtrando por Status: {filters.status} | Data Inicial: {filters.startDate}
                </p>
                <button 
                    onClick={() => updateFilter('status', filters.status === 'all' ? 'Novo' : 'all')}
                    className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                >
                    Toggle Status Filtro (Demo)
                </button>
            </div>

            {/* Ações de Exportação */}
            <div className="flex justify-end space-x-3 mb-6">
                <button 
                    onClick={exportToCsv} 
                    disabled={exporting || loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                    <FaDownload className="mr-2" /> 
                    {exporting ? 'Exportando CSV...' : 'Exportar CSV'}
                </button>
                <button 
                    onClick={exportToPdf} 
                    disabled={exporting || loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                    <FaDownload className="mr-2" /> 
                    {exporting ? 'Exportando PDF...' : 'Exportar PDF'}
                </button>
            </div>
            
            {error && <ErrorMessage message={error} />}
            {loading && data && <LoadingSpinner message="Atualizando dados..." />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card de Previsão de Vendas (ForecastCard.jsx) */}
                {/* Tabela de Produtividade */}
                <div className="lg:col-span-2">
                    <ProductivityTable metrics={data?.productivity} />
                </div>
                {/* Outros Componentes de Relatório */}
                <div className="lg:col-span-1">
                    {/* FunnelChart.jsx ou outros gráficos */}
                </div>
            </div>
            
        </div>
    );
}

export default ReportsPage;