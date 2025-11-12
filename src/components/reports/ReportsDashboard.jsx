// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import KPICard from './KPICard.jsx';
import ProductivityTable from './ProductivityTable.jsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { FaBolt, FaChartLine, FaHandshake, FaHourglass } from 'react-icons/fa';

const THEME = {
  primary: '#1A7F3C',
  danger: '#EF4444',
  blue: '#2563EB',
  muted: '#6B7280',
  bg: '#FFFFFF'
};

const COLORS_PIE = [THEME.primary, THEME.danger, THEME.blue];

export default function ReportsDashboard({ data, loading, error }) {
  // states de carregamento / erro tratados pelo pai; aqui só garantimos fallback
  if (loading && !data) {
    return <div className="text-center p-8 text-indigo-600">Carregando métricas do Dashboard...</div>;
  }
  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-2xl">{String(error)}</div>;
  }
  if (!data) {
    return <div className="text-center p-8 text-gray-600 bg-gray-50 rounded-2xl">Aplique filtros para carregar o relatório.</div>;
  }

  // dados principais (vêm do backend via ReportDataService)
  const productivity = data.productivity || {};

  const totalLeads = productivity.totalLeads ?? 0;
  const leadsActive = productivity.leadsActive ?? 0;
  const totalWonCount = productivity.totalWonCount ?? 0;
  const totalWonValueKW = productivity.totalWonValueKW ?? 0;
  const conversionRate = productivity.conversionRate ?? 0;
  const lossRate = productivity.lossRate ?? 0;
  const avgClosingTimeDays = productivity.avgClosingTimeDays ?? 0;

  // Pie: ganhos / perdas / ativos (contagem)
  const pieData = [
    { name: 'Ganhos', value: totalWonCount },
    { name: 'Perdas', value: Math.round(totalLeads * lossRate) },
    { name: 'Ativos', value: leadsActive }
  ];

  // Bar: kW vendido (valor) vs tempo médio (dias)
  const barData = [
    { name: 'kW Vendido', value: Number(totalWonValueKW) || 0 },
    { name: 'Tempo Médio (dias)', value: Number(avgClosingTimeDays) || 0 }
  ];

  const fmtKW = (v) => `${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;
  const fmtPct = (v) => `${(Number(v || 0) * 100).toFixed(1).replace('.', ',')}%`;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <KPICard title="Total de Leads" value={totalLeads.toLocaleString('pt-BR')} description="Total de leads no período." Icon={FaChartLine} borderColor={THEME.blue} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <KPICard title="Leads Ativos" value={leadsActive.toLocaleString('pt-BR')} description="Leads em atendimento/negociação." Icon={FaHandshake} borderColor={THEME.primary} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <KPICard title="Vendas Concluídas (Qtd)" value={totalWonCount.toLocaleString('pt-BR')} description="Qtd. de leads ganhos." Icon={FaBolt} borderColor={THEME.primary} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <KPICard title="Tempo Médio de Fechamento" value={`${avgClosingTimeDays.toFixed(1).replace('.', ',')} dias`} description="Média desde criação até ganho." Icon={FaHourglass} borderColor={THEME.muted} />
        </motion.div>
      </div>

      {/* Main block: table (left) + charts (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Productivity table (large) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Relatório de Produtividade do Vendedor</h2>
            <div className="text-sm text-gray-500">Resumo</div>
          </div>
          <ProductivityTable metrics={productivity} />
        </div>

        {/* Right: pie + bar */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h3 className="text-md font-medium mb-2">Distribuição: Ganhos / Perdas / Ativos</h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS_PIE[idx % COLORS_PIE.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)} />
                  <Legend verticalAlign="bottom" height={28} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-gray-500">Distribuição por contagem de leads.</div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <h3 className="text-md font-medium mb-2">kW Vendido x Tempo Médio</h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => (typeof v === 'number' ? (v === barData[0].value ? fmtKW(v) : `${v} dias`) : v)} />
                  <Bar dataKey="value" fill={THEME.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-gray-500">kW total vendido (em kW) e tempo médio de fechamento (dias).</div>
          </div>
        </div>
      </div>

      {/* Lower: funnel and engagement placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow min-h-[200px]">
          <h3 className="text-lg font-semibold mb-3">Analítico de Funil por Origem</h3>
          {Array.isArray(data?.conversionBySource) && data.conversionBySource.length > 0 ? (
            // render logic if backend supplies conversionBySource
            <div>/* Funil / charts aqui */</div>
          ) : (
            <div className="p-6 bg-gray-50 rounded text-gray-500 border border-dashed">Sem dados de origem para este período.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow min-h-[200px]">
          <h3 className="text-lg font-semibold mb-3">Relatório de Resposta e Engajamento</h3>
          {Array.isArray(data?.responseMetrics) && data.responseMetrics.length > 0 ? (
            <div>/* charts */</div>
          ) : (
            <div className="p-6 bg-gray-50 rounded text-gray-500 border border-dashed">Sem dados de resposta/engajamento para este período.</div>
          )}
        </div>
      </div>
    </div>
  );
}
