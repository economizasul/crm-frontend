// src/pages/ReportsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard.jsx';

const initialFilters = {
  // Ajuste o período inicial conforme a necessidade (e.g., último mês)
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

        {/* Filter Bar */}
        <FilterBar
          currentFilters={filters}
          onFilterChange={updateFilter}
          onApplyFilters={applyFilters}
          exportToCsv={exportToCsv}
          exportToPdf={exportToPdf}
          isLoading={loading}
          isExporting={exporting}
        />

        {/* Quick Summary */}
        <div className="mt-6 p-4 bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center">
            {/* Título */}
            <h2 className="text-xl font-semibold text-gray-800">
              Dashboard de Performance
            </h2>

            {/* quick summary (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-sm text-gray-600">
                {/* 🟢 CORREÇÃO: Uso seguro com ?? 0 e Number() */}
                <div className="font-semibold">{Number(data?.productivity?.totalLeads ?? 0).toLocaleString('pt-BR')}</div>
                <div className="text-xs">Leads</div>
              </div>
              <div className="text-sm text-gray-600">
                {/* 🟢 CORREÇÃO: totalWonValueKW renomeado para totalKwWon (nome do Backend) */}
                <div className="font-semibold">{Number(data?.productivity?.totalKwWon ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kW</div>
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm">
            ❌ <strong>Erro ao carregar dados.</strong> O Backend pode estar indisponível ou os filtros não retornaram dados.
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}