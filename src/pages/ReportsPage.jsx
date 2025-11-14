// src/pages/ReportsPage.jsx (COMPLETO E CORRIGIDO)
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

// Funções auxiliares para formatação de exibição
const formatPercent = (value) => `${(Number(value ?? 0) * 100).toFixed(1).replace('.', ',')}%`;
const formatKw = (value) => `${Number(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW`;
const formatDays = (value) => `${Number(value ?? 0).toFixed(1).replace('.', ',')} dias`;
const formatNumber = (value) => Number(value ?? 0).toLocaleString('pt-BR');


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

  // Usa a nova estrutura do backend: data.globalSummary
  const summary = data?.globalSummary;
  
  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#0F172A]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="text-3xl font-extrabold text-[#1A7F3C] mb-6"
        >
          Relatórios & Métricas
        </motion.h1>

        {/* Bloco de Filtros e Resumo Rápido */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {/* Filter Bar */}
            <div className="flex-grow">
              <FilterBar
                currentFilters={filters}
                onFilterChange={updateFilter}
                onApplyFilters={applyFilters}
                exportToCsv={exportToCsv}
                exportToPdf={exportToPdf}
                isLoading={loading}
                isExporting={exporting}
              />
            </div>

            {/* Resumo Rápido (4 Métricas Globais) */}
            {/* 🚨 CORRIGIDO: Usa data.globalSummary para o histórico e exibe 4 métricas */}
            <div className="hidden lg:flex items-center gap-6 divide-x divide-gray-200 pl-4">

              {/* 1. Total de Leads (Global) */}
              <div className="text-sm text-gray-600 pr-6">
                <div className="font-semibold text-xl text-[#0F172A]">
                    {formatNumber(summary?.totalLeads)}
                </div>
                <div className="text-xs">Leads Totais</div>
              </div>

              {/* 2. KW Vendido (Global) */}
              <div className="text-sm text-gray-600 px-6">
                <div className="font-semibold text-xl text-green-600">
                    {formatKw(summary?.totalWonValueKW)}
                </div>
                <div className="text-xs">KW Vendido (Histórico)</div>
              </div>

              {/* 3. Taxa de Conversão (Global) */}
              <div className="text-sm text-gray-600 px-6">
                <div className="font-semibold text-xl text-blue-600">
                    {formatPercent(summary?.conversionRate)}
                </div>
                <div className="text-xs">Conversão (Histórico)</div>
              </div>

              {/* 4. Tempo Médio de Fechamento (Global) */}
              <div className="text-sm text-gray-600 pl-6">
                <div className="font-semibold text-xl text-orange-600">
                    {formatDays(summary?.avgClosingTimeDays)}
                </div>
                <div className="text-xs">Fechamento Médio (Histórico)</div>
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
            ❌ Erro ao carregar o relatório: {error}
          </div>
        )}
      </div>
    </div>
  );
}