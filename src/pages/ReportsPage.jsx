// src/pages/ReportsPage.jsx
import React from 'react';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-[#F7F9FB] text-[#0f172a]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-3xl font-extrabold text-[#1A7F3C] mb-4">
            Relatórios e Métricas
          </h1>
        </motion.div>

        {/* Barra de filtros — usa seu FilterBar existente */}
        <div className="sticky top-6 z-30">
          <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <FilterBar
                currentFilters={filters}
                onFilterChange={updateFilter}
                onApplyFilters={applyFilters}
                exportToCsv={exportToCsv}
                exportToPdf={exportToPdf}
                isExporting={exporting}
                isLoading={loading}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo do dashboard */}
        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {/* Mensagem caso não existam dados */}
        {!data && !loading && !error && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm">
            📊 Use a barra de filtros acima e clique em <b>Aplicar Filtros</b> para carregar o relatório.
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
            Erro: {String(error)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
