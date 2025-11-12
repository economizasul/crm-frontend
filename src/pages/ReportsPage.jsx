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

        {/* ====================== TÍTULO PRINCIPAL ====================== */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-[#1A7F3C]">
            Relatórios e Métricas
          </h1>
        </div>

        {/* ====================== FILTROS SUPERIORES ====================== */}
        <div className="sticky top-6 z-30">
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
            <div className="flex-1">
              {/* Mantém seu FilterBar original, já com funções e botões */}
              <FilterBar
                currentFilters={filters}
                onFilterChange={updateFilter}
                onApplyFilters={applyFilters}
                isLoading={loading}
              />
            </div>
          </div>
        </div>

        {/* ====================== CONTEÚDO PRINCIPAL ====================== */}
        <div className="mt-8">
          <ReportsDashboard
            data={data}
            loading={loading}
            error={error}
          />
        </div>

        {/* ====================== ESTADOS DE FEEDBACK ====================== */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl shadow-sm">
            ⚠️ Ocorreu um erro ao carregar os relatórios. Tente novamente.
          </div>
        )}

        {!data && !loading && !error && (
          <div className="mt-8 bg-white border border-gray-200 text-gray-700 p-4 rounded-2xl shadow-sm">
            📊 Use os filtros acima e clique em <b>Aplicar Filtros</b> para carregar os dados.
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
