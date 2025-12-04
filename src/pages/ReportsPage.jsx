// src/pages/ReportsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard.jsx';
import { format, subDays } from 'date-fns';

const today = new Date();
const defaultEnd = format(today, 'yyyy-MM-dd');
const defaultStart = format(subDays(today, 29), 'yyyy-MM-dd');

const initialFilters = {
  startDate: defaultStart,
  endDate: defaultEnd,
  ownerId: null,
  source: null
};

const formatPercent = (value) => `${(Number(value ?? 0) * 100).toFixed(1).replace('.', ',')}%`;
const formatKw = (value) => `${Number(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW`;
const formatDays = (value) => `${Number(value ?? 0).toFixed(1).replace('.', ',')} dias`;
const formatNumber = (value) => Number(value ?? 0).toLocaleString('pt-BR');

export default function ReportsPage() {
  const {
    data = {},
    filters = initialFilters,
    loading = false,
    error = null,
    exporting = false,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
  } = useReports(initialFilters);

  const summary = data?.globalSummary || {};

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

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
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

            {/* KPIs RÁPIDOS - AGORA COM TAXA DE INAPTOS E ATENDIMENTOS */}
            <div className="hidden lg:flex items-center gap-6 divide-x divide-gray-200">
              {/* Leads Totais */}
              <div className="text-center pr-6">
                <div className="font-semibold text-2xl text-[#0F172A]">
                  {formatNumber(summary?.totalLeads)}
                </div>
                <div className="text-xs text-gray-600">Leads Totais</div>
              </div>

              {/* KW Vendido */}
              <div className="text-center px-6">
                <div className="font-semibold text-2xl text-green-600">
                  {formatKw(summary?.totalWonValueKW)}
                </div>
                <div className="text-xs text-gray-600">KW Vendido</div>
              </div>

              {/* Taxa de Conversão */}
              <div className="text-center px-6">
                <div className="font-semibold text-2xl text-green-700">
                  {formatPercent(summary?.conversionRate)}
                </div>
                <div className="text-xs text-gray-600">Taxa de Conversão</div>
              </div>

              {/* NOVO: Taxa de Inaptos (vermelho forte) */}
              <div className="text-center px-6">
                <div className="font-semibold text-2xl text-red-600">
                  {Number(summary?.taxaInapto ?? 0).toFixed(1).replace('.', ',')}%
                  <span className="block text-sm font-normal text-red-500 mt-1">
                    ({formatNumber(summary?.totalInaptoCount)} leads)
                  </span>
                </div>
                <div className="text-xs text-gray-600">Taxa de Inaptos</div>
              </div>

              {/* NOVO: Atendimentos Realizados (azul forte) */}
              <div className="text-center px-6">
                <div className="font-semibold text-2xl text-blue-600">
                  {formatNumber(summary?.atendimentosRealizados)}
                </div>
                <div className="text-xs text-gray-600">Atendimentos Realizados</div>
              </div>

              {/* Tempo Médio de Fechamento */}
              <div className="text-center pl-6">
                <div className="font-semibold text-2xl text-orange-600">
                  {formatDays(summary?.avgClosingTimeDays || 0)}
                </div>
                <div className="text-xs text-gray-600">Fechamento Médio</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {/* Placeholder */}
        {!loading && !error && (!data || Object.keys(data).length === 0) && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm text-center">
            Use os filtros acima e clique em <strong>Aplicar Filtros</strong> para carregar o relatório.
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm">
            Erro ao carregar o relatório: {error}
          </div>
        )}
      </div>
    </div>
  );
}