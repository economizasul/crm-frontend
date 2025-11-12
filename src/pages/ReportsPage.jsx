// src/pages/ReportsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard.jsx';

const initialFilters = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  ownerId: 'all',
  source: 'all'
};

export default function ReportsPage() {
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
    <div className="min-h-screen bg-[#F7F9FB] text-[#0F172A]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="text-3xl font-extrabold text-[#1A7F3C] mb-4"
        >
          Relatórios & Métricas
        </motion.h1>

        {/* Filters header */}
        <div className="sticky top-6 z-40">
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            {/* quick summary (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-sm text-gray-600">
                <div className="font-semibold">{(data?.productivity?.totalLeads ?? 0).toLocaleString('pt-BR')}</div>
                <div className="text-xs">Leads</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold">{Number(data?.productivity?.totalWonValueKW ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW</div>
                <div className="text-xs">kW Vendido</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard main */}
        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {/* Fallback messages */}
        {!data && !loading && !error && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm text-center">
            📊 Use os filtros acima e clique em <strong>Aplicar Filtros</strong> para carregar o relatório.
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
            Erro ao carregar dados: {String(error)}
          </div>
        )}
      </div>
    </div>
  );
}
