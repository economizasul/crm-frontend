// src/pages/ReportsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
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
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
  } = useReports(initialFilters);

  // Helpers de formatação (reutilizáveis)
  const formatKW = (value) => {
    const n = Number(value || 0);
    // mostra "1.352,00 kW"
    return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;
  };

  const formatShortKW = (value) => {
    const n = Number(value || 0);
    // mostra "1.352 kW" (sem casas decimais)
    return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW`;
  };

  // Valores rápidos para exibir nos lugares onde precisamos de resumo acima do dashboard
  const productivity = data?.productivity || {};
  const totalKw = productivity.totalWonValueKW ?? productivity.totalWonValue ?? 0;
  const totalLeads = productivity.totalLeads ?? 0;

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#0f172a]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="mb-4"
        >
          <h1 className="text-3xl font-extrabold text-[#1A7F3C]">Relatórios e Métricas</h1>
        </motion.div>

        {/* Barra de filtros */}
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
            {/* quick summary à direita (compacto) */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium">{totalLeads.toLocaleString('pt-BR')}</div>
                <div className="text-xs">Total de Leads</div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium">{formatShortKW(totalKw)}</div>
                <div className="text-xs">Valor Total (kW)</div>
              </div>
            </div>
          </div>
        </div>

        {/* espaço entre header e conteúdo */}
        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {/* Mensagem caso não existam dados */}
        {!data && !loading && !error && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm">
            📊 Use a barra de filtros acima e clique em <b>Aplicar Filtros</b> para carregar o relatório.
          </div>
        )}

        {/* Error box */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
            Erro: {String(error)}
          </div>
        )}

        {/* Pequeno rodapé com infos sobre geração/export (opcional) */}
        <div className="mt-6 text-xs text-gray-500">
          <div>Relatório gerado a partir dos dados do sistema. Exportações CSV/PDF utilizam os filtros aplicados.</div>
          <div className="mt-1">Se quiser que o painel exiba Funil por Origem ou Métricas de Resposta automáticas, posso adicionar as queries no backend.</div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
