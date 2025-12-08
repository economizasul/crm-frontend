import React from 'react';
import { motion } from 'framer-motion';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard.jsx';
import { format, subDays } from 'date-fns';

const today = new Date();
const defaultEnd = format(today, 'yyyy-MM-dd');
const defaultStart = format(subDays(today, 29), 'yyyy-MM-dd'); // últimos 30 dias

const initialFilters = {
  startDate: defaultStart,
  endDate: defaultEnd,
  ownerId: null,
  source: null
};

const formatPercent = (value) => `${(Number(value ?? 0)).toFixed(1).replace('.', ',')}%`;
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

  // Use globalSummary para o pré-relatório superior
  const summary = data?.globalSummary || {};

  // Ajuste nomes: backend expõe tempo em horas -> converter onde necessário
  const tempoAtendimentoHoras = Number(summary?.tempoMedioAtendimentoHoras || 0);
  const tempoFechamentoHoras = Number(summary?.tempoMedioFechamentoHoras || 0);
  const tempoFechamentoDias = (tempoFechamentoHoras / 24);

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

            <div className="hidden lg:flex items-center gap-6 divide-x divide-gray-200 pl-4">
              <div className="text-sm text-gray-600 pr-6">
                  <div className="font-semibold text-xl text-[#0F172A]">
                      {formatNumber(summary?.totalLeads)}
                  </div>
                  <div className="text-xs">Leads Totais</div>
                </div>

                <div className="text-sm text-gray-600 px-6">
                  <div className="font-semibold text-xl text-green-600">
                      {formatKw(summary?.totalWonValueKW)}
                  </div>
                  <div className="text-xs">KW Vendido (Histórico)</div>
                </div>

                <div className="text-sm text-gray-600 px-6">
                  <div className="font-semibold text-xl text-blue-600">
                      {formatPercent(summary?.conversionRate)}
                  </div>
                  <div className="text-xs">Conversão (Histórico)</div>
                </div>

                <div className="text-sm text-gray-600 px-6">
                  <div className="font-semibold text-xl text-blue-700">
                      {Number(tempoAtendimentoHoras).toFixed(1).replace('.', ',')} h
                  </div>
                  <div className="text-xs">Tempo de Atendimento (Horas)</div>
                </div>

                <div className="text-sm text-gray-600 pl-6">
                  <div className="font-semibold text-xl text-orange-600">
                      {Number(tempoFechamentoDias).toFixed(1).replace('.', ',')} dias
                  </div>
                  <div className="text-xs">Fechamento Médio (Dias)</div>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {!loading && !error && (!data || Object.keys(data).length === 0) && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm text-center">
            Use os filtros acima e clique em <strong>Aplicar Filtros</strong> para carregar o relatório.
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm">
            Erro ao carregar o relatório: {error}
          </div>
        )}
      </div>
    </div>
  );
}
