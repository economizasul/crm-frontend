// src/pages/ReportsPage.jsx
import React from 'react';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { FaChartBar } from 'react-icons/fa';

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
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
  } = useReports(initialFilters);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <FaChartBar className="mr-3 text-indigo-600" />
        Dashboard de Relatórios
      </h1>

      <FilterBar
        currentFilters={filters}
        onFilterChange={updateFilter}
        onApplyFilters={applyFilters}
        exportToCsv={exportToCsv}
        exportToPdf={exportToPdf}
        isExporting={exporting}
        isLoading={loading}
      />

      <div className="mt-6">
        <ReportsDashboard data={data} loading={loading} error={error} />
      </div>

      {!data && !loading && !error && (
        <div className="mt-8 p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded-lg">
          📊 Use a barra de filtros acima e clique em <b>Aplicar Filtros</b> para carregar o relatório.
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
