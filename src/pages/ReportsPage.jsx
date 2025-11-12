// src/pages/ReportsPage.jsx
import React from 'react';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard';

const initialFilters = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  ownerId: 'all',
  source: 'all'
};

function ReportsPage() {
  const {
    data,
    filters,
    loading,
    error,
    updateFilter,
    applyFilters,
  } = useReports(initialFilters);

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#1E293B]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold">Relatórios e Métricas</h1>
        </div>

        {/* ====== Barra de filtros (mantendo seu componente original) ====== */}
        <div className="sticky top-6 z-30">
          <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <FilterBar
                currentFilters={filters}
                onFilterChange={updateFilter}
                onApplyFilters={applyFilters}
                isLoading={loading}
              />
            </div>
          </div>
        </div>

        {/* Espaço entre header e conteúdo */}
        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {/* Mensagem caso não existam dados */}
        {!data && !loading && !error && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm">
            📊 Use a barra de filtros acima e clique em <b>Aplicar Filtros</b> para carregar o relatório.
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
