// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import KPICard from './KPICard';
import ProductivityTable from './ProductivityTable';

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
  LineChart,
  Line,
} from 'recharts';

const COLORS = {
  green: '#1A7F3C',
  orange: '#E57C23',
  blue: '#2563eb',
  red: '#ef4444',
  gray: '#9ca3af'
};

function ReportsDashboard({ data, loading, error }) {
  if (loading && !data) {
    return (
      <div className="text-center p-8 text-lg text-[#1A7F3C]">
        Carregando métricas do Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-lg text-red-600 bg-red-50 rounded-2xl border border-red-200">
        Erro ao carregar dados: {String(error)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-6 text-lg text-gray-600 bg-gray-50 rounded-2xl border border-gray-200">
        Aplique filtros para carregar o relatório.
      </div>
    );
  }

  // O backend retorna um objeto com `productivity` (conforme ReportDataService)
  const productivity = data.productivity || {};

  // Valores primários
  const totalLeads = productivity.totalLeads ?? 0;
  const leadsActive = productivity.leadsActive ?? 0;
  const totalWonCount = productivity.totalWonCount ?? 0;
  const totalLostCount = productivity.totalLostCount ?? 0;
  const totalWonValueKW = productivity.totalWonValueKW ?? 0;
  const conversionRate = productivity.conversionRate ?? 0;
  const lossRate = productivity.lossRate ?? 0;
  const avgClosingTimeDays = productivity.avgClosingTimeDays ?? 0;

  // Pie data: contagem (ganhos/perdas/ativos)
  const pieData = [
    { name: 'Ganhos', value: totalWonCount, color: COLORS.green },
    { name: 'Perdas', value: totalLostCount, color: COLORS.red },
    { name: 'Ativos', value: leadsActive, color: COLORS.blue },
  ];

  // Bar data: kW vendido vs tempo médio fechamento (apenas para visual)
  // Transform to chart-friendly format
  const barData = [
    { name: 'kW Vendido', metric: Number(totalWonValueKW) || 0 },
    { name: 'Tempo Médio (dias)', metric: Number(avgClosingTimeDays) || 0 },
  ];

  const formatPercent = (v) => `${(Number(v) * 100).toFixed(1).replace('.', ',')}%`;
  const formatKW = (v) =>
    `${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;

  return (
    <div className="space-y-8">
      {/* ====== KPIs ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.02}}>
          <KPICard
            title="Total de Leads"
            value={totalLeads.toLocaleString('pt-BR')}
            description="Total de leads no período selecionado."
            borderColor={COLORS.blue}
          />
        </motion.div>

        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.06}}>
          <KPICard
            title="Leads Ativos"
            value={leadsActive.toLocaleString('pt-BR')}
            description="Leads em atendimento/negociação."
            borderColor={COLORS.orange}
          />
        </motion.div>

        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.10}}>
          <KPICard
            title="Vendas Concluídas (Qtd)"
            value={totalWonCount.toLocaleString('pt-BR')}
            description="Quantidade de leads movidos para Ganho."
            borderColor={COLORS.green}
          />
        </motion.div>

        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.14}}>
          <KPICard
            title="Valor Total (kW)"
            value={formatKW(totalWonValueKW)}
            description="Soma do consumo (kW) das vendas concluídas."
            borderColor={COLORS.green}
          />
        </motion.div>
      </div>

      {/* ====== Grid com tabela e gráficos ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: tabela de produtividade (col-span 2 em telas grandes) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Relatório de Produtividade do Vendedor</h2>
            <div className="text-sm text-gray-500">Resumo por vendedor</div>
          </div>

          {/* ProductivityTable recebe o objeto `productivity` */}
          <ProductivityTable metrics={productivity} />
        </div>

        {/* Right: gráficos compactos */}
        <div className="space-y-6">
          {/* Pie: Ganhos vs Perdas vs Ativos */}
          <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-md font-medium mb-2">Distribuição: Ganhos / Perdas / Ativos</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color || Object.values(COLORS)[idx % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString?.('pt-BR') ?? value} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">Valores em quantidade de leads. (kW representado em cards)</p>
          </div>

          {/* Bar: kW Vendido e Tempo Médio */}
          <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-md font-medium mb-2">kW Vendido vs Tempo Médio</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 6, right: 6, left: -12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'metric' && name) {
                      // If metric corresponds to kW, format accordingly
                      return [value, 'Valor'];
                    }
                    return value;
                  }} />
                  <Bar dataKey="metric" fill={COLORS.green} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">kW vendido (total) e tempo médio de fechamento (dias).</p>
          </div>
        </div>
      </div>

      {/* ====== Espaço para futura expansão: funil por origem, resposta/engajamento ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-4">Analítico de Funil por Origem</h3>
          <div className="text-sm text-gray-500 mb-4">
            Se o backend fornecer dados por origem (ex: conversionBySource), exibiremos um funil + barras por fonte aqui.
          </div>

          {/* fallback caso não hajam dados por origem */}
          {data.conversionBySource && Array.isArray(data.conversionBySource) && data.conversionBySource.length > 0 ? (
            <div style={{ height: 260 }}>
              {/* Se tiver ConversionChart component, poderia ser usado aqui */}
              {/* For now, simple bar chart */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.conversionBySource.map(c => ({ name: c.source || c.name, value: c.count || c.total || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.orange} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg border border-dashed text-gray-500">Sem dados de origem para este período.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-4">Relatório de Resposta e Engajamento</h3>
          <div className="text-sm text-gray-500 mb-4">Se disponível: tempo médio de resposta e ações por vendedor.</div>

          {data.responseMetrics && data.responseMetrics.series ? (
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.responseMetrics.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgRespHours" stroke={COLORS.green} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg border border-dashed text-gray-500">Sem dados de resposta para este período.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;
