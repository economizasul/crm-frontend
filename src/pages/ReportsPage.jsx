// src/pages/ReportsPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ProductivityTable from '../components/reports/ProductivityTable.jsx';
import KPICard from '../components/reports/KPICard.jsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { FaFileCsv, FaFilePdf } from 'react-icons/fa';

const THEME = {
  bg: '#F7F9FB',
  text: '#0F172A',
  primary: '#1A7F3C',
  secondary: '#E57C23',
  blue: '#2563EB',
  danger: '#EF4444'
};

const COLORS_PIE = [THEME.primary, THEME.danger, THEME.blue];

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
    exportToPdf
  } = useReports(initialFilters);

  // Backend returns data.productivity per ReportDataService
  const productivity = data?.productivity || {};

  const totalLeads = productivity.totalLeads ?? 0;
  const leadsActive = productivity.leadsActive ?? 0;
  const totalWonCount = productivity.totalWonCount ?? 0;
  const totalWonValueKW = productivity.totalWonValueKW ?? 0;
  const conversionRate = productivity.conversionRate ?? 0;
  const lossRate = productivity.lossRate ?? 0;
  const avgClosingTimeDays = productivity.avgClosingTimeDays ?? 0;

  const pieData = [
    { name: 'Ganhos', value: totalWonCount || 0 },
    { name: 'Perdas', value: Math.round(totalLeads * lossRate) || 0 },
    { name: 'Ativos', value: leadsActive || 0 }
  ];

  const barData = [
    { name: 'kW Vendido', value: Number(totalWonValueKW) || 0 },
    { name: 'Tempo Médio (dias)', value: Number(avgClosingTimeDays) || 0 }
  ];

  const fmtKW = (v) =>
    `${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;

  const fmtPct = (v) => `${(Number(v || 0) * 100).toFixed(1).replace('.', ',')}%`;

  return (
    <div className="min-h-screen" style={{ background: THEME.bg, color: THEME.text }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: THEME.primary }}>
            Relatórios e Métricas
          </h1>
        </motion.div>

        {/* Filters + quick summary */}
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

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-sm text-gray-600 mr-2">
                <span className="font-semibold">{totalLeads.toLocaleString('pt-BR')}</span>
                <span>Leads</span>
              </div>

              <div className="hidden md:flex flex-col text-sm text-gray-600 mr-2">
                <span className="font-semibold">{fmtKW(totalWonValueKW)}</span>
                <span>kW Vendido</span>
              </div>

              <button
                onClick={exportToCsv}
                disabled={exporting}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border hover:shadow text-sm"
                title="Exportar CSV"
              >
                <FaFileCsv className="text-green-600" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={exportToPdf}
                disabled={exporting}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border hover:shadow text-sm"
                title="Exportar PDF"
              >
                <FaFilePdf className="text-red-600" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top-level KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <KPICard title="Total de Leads" value={totalLeads.toLocaleString('pt-BR')} description="Total de leads no período." borderColor={THEME.blue} />
          <KPICard title="Leads Ativos" value={leadsActive.toLocaleString('pt-BR')} description="Leads em atendimento/negociação." borderColor={THEME.secondary} />
          <KPICard title="Vendas Concluídas (Qtd)" value={totalWonCount.toLocaleString('pt-BR')} description="Leads movidos para Ganho." borderColor={THEME.primary} />
          <KPICard title="Valor Total (kW)" value={fmtKW(totalWonValueKW)} description="Soma de kW dos leads ganhos." borderColor={THEME.primary} />
        </div>

        {/* Main content area: table (left) + charts (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left: Productivity Table (spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Relatório de Produtividade do Vendedor</h2>
              <div className="text-sm text-gray-500">Resumo e comparação</div>
            </div>
            <ProductivityTable metrics={productivity} />
          </div>

          {/* Right: small charts */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow">
              <h3 className="text-md font-medium mb-2">Distribuição: Ganhos / Perdas / Ativos</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, i) => <Cell key={`c-${i}`} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => v?.toLocaleString('pt-BR') ?? v} />
                    <Legend verticalAlign="bottom" height={28} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow">
              <h3 className="text-md font-medium mb-2">kW Vendido x Tempo Médio</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={160} />
                    <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)} />
                    <Bar dataKey="value" fill={THEME.primary} radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-500">kW total vendido e tempo médio em dias.</p>
            </div>
          </div>
        </div>

        {/* Lower sections: placeholders for future data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow min-h-[180px]">
            <h3 className="text-lg font-semibold mb-2">Analítico de Funil por Origem</h3>
            <div className="text-sm text-gray-500">Sem dados por origem para este período.</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow min-h-[180px]">
            <h3 className="text-lg font-semibold mb-2">Relatório de Resposta e Engajamento</h3>
            <div className="text-sm text-gray-500">Sem dados de resposta/engajamento para este período.</div>
          </div>
        </div>

        {/* Footer / hints */}
        <div className="mt-6 text-xs text-gray-500">
          <div>Exportações utilizam os filtros aplicados.</div>
          <div>Caso queira preencher Funil por Origem ou Métricas de Resposta, posso adicionar as queries no backend.</div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
            Erro: {String(error)}
          </div>
        )}
      </div>
    </div>
  );
}
