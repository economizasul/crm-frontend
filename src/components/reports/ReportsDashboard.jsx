// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import KPICard from './KPICard';
import ProductivityTable from './ProductivityTable';
import ConversionChart from './ConversionChart';
import FunnelChart from './FunnelChart';
import ForecastCard from './ForecastCard';
import AnalyticNotes from './AnalyticNotes';
import LostReasonsTable from './LostReasonsTable';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

import { FaChartLine, FaBolt, FaHandshake, FaHourglassHalf } from 'react-icons/fa';

/**
 * ReportsDashboard (layout modernizado / inspirado na imagem)
 * Recebe `data` com a forma esperada pelo useReports.
 */
function ReportsDashboard({ data, loading, error }) {
  // Estados de loading/erro/sem-dados (mantive mensagens simples)
  if (loading && !data) {
    return (
      <div className="text-center p-8 text-xl text-indigo-600">
        Carregando métricas do Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-xl text-red-600 border border-red-300 bg-red-50 rounded-lg">
        Erro ao carregar dados: {String(error)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-xl text-gray-500 border border-gray-300 bg-gray-50 rounded-lg">
        Aplique filtros para carregar o relatório.
      </div>
    );
  }

  // Desestruturação segura
  const { productivity = {}, conversionBySource = [], responseMetrics = {}, activities = [], forecast = {}, lostLeads = [], analyticNotes = [] } = data;

  // Formatadores rápidos
  const formatPercent = (value) => {
    if (value === undefined || value === null) return '0%';
    const n = Number(value);
    return `${(n * 100).toFixed(1).replace('.', ',')}%`;
  };

  const formatKW = (value) => {
    const n = Number(value || 0);
    return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;
  };

  const formatDays = (value) => {
    const n = Number(value || 0);
    return `${n.toFixed(1).replace('.', ',')} dias`;
  };

  // KPI cards (mantive ícones reutilizáveis)
  const kpiMetrics = [
    {
      title: 'Valor Total (kW)',
      value: productivity.totalWonValueKW ? formatKW(productivity.totalWonValueKW) : formatKW(productivity.totalWonValue),
      description: 'Total de consumo (kW) dos leads convertidos.',
      Icon: FaBolt,
    },
    {
      title: 'Taxa de Conversão',
      value: formatPercent(productivity.conversionRate),
      description: 'Leads convertidos / Total de leads.',
      Icon: FaHandshake,
    },
    {
      title: 'Leads Ativos',
      value: (productivity.leadsActive || 0).toLocaleString('pt-BR'),
      description: 'Leads nas fases ativas (não Ganho / não Perdido).',
      Icon: FaChartLine,
    },
    {
      title: 'Tempo Médio de Fechamento',
      value: formatDays(productivity.avgClosingTimeDays),
      description: "Média de dias desde o cadastro até o 'Fechado/Ganho'.",
      Icon: FaHourglassHalf,
    },
  ];

  // Dados para pequenos gráficos (fallbacks)
  const conversionData = conversionBySource.length
    ? conversionBySource.map((c) => ({ name: c.source || c.name, value: (c.conversionRate || c.rate || 0) * 100 }))
    : [
        { name: 'Google', value: 34 },
        { name: 'Facebook', value: 19 },
        { name: 'Linkedin', value: 23 },
        { name: 'Outros', value: 12 },
      ];

  const responseSeries = responseMetrics.series || [
    { name: '01/01', avgRespHours: 24, replies: 15 },
    { name: '07/01', avgRespHours: 20, replies: 18 },
    { name: '14/01', avgRespHours: 22, replies: 22 },
    { name: '21/01', avgRespHours: 18, replies: 26 },
  ];

  const actionsSeries = activities.length
    ? activities
    : [
        { name: '30', calls: 10, emails: 8, notes: 3 },
        { name: '60', calls: 12, emails: 10, notes: 4 },
        { name: '90', calls: 15, emails: 12, notes: 6 },
        { name: '120', calls: 18, emails: 16, notes: 8 },
      ];

  // Pequenos componentes internos (usar Recharts)
  const ResponseChart = ({ data }) => (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => v} />
          <Tooltip />
          <Line type="monotone" dataKey="avgRespHours" stroke="#4f46e5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="replies" stroke="#06b6d4" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const ActionsByVendorChart = ({ data }) => (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="calls" stackId="a" />
          <Bar dataKey="emails" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // ========== RENDER ==========
  return (
    <div className="space-y-8">
      {/* ====== KPI Cards ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((m, i) => (
          <KPICard
            key={i}
            title={m.title}
            value={m.value}
            description={m.description}
            Icon={m.Icon}
          />
        ))}
      </div>

      {/* ====== Linha: Tabela Produtividade | Taxa de Resposta | Funil ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PRODUTIVIDADE (2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Relatório de Produtividade do Vendedor</h2>
            <div className="text-sm text-gray-500">Resumo geral</div>
          </div>
          <ProductivityTable metrics={productivity} />
        </div>

        {/* TAXA DE RESPOSTA + FUNIL (1/3) */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-md font-medium mb-2">Taxa de Réplica / Tempo de Resposta (Horas)</h3>
            <ResponseChart data={responseSeries} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-md font-medium mb-2">Análise de Funil por Origem de Lead</h3>
            {/* Se você já tem FunnelChart, usamos o componente existente */}
            {typeof FunnelChart === 'function' ? (
              <div style={{ height: 220 }}>
                <FunnelChart data={conversionBySource} />
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-8">Sem componente de funil.</div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Linha: Engajamento (2x) e Forecast (1x) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Relatório de Resposta e Engajamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-md p-4 border">
              <p className="text-sm text-gray-600 mb-2">Ações Registradas por Vendedor (Últimas 4 Semanas)</p>
              <ActionsByVendorChart data={actionsSeries} />
            </div>

            <div className="bg-white rounded-md p-4 border">
              <p className="text-sm text-gray-600 mb-2">Ações Registradas por Vendedor (Últimas 4 Semanas)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={actionsSeries} margin={{ top: 6, right: 8, left: -12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#4f46e5" dot={false} />
                  <Line type="monotone" dataKey="emails" stroke="#06b6d4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Relatório de Previsão de Vendas (Forecasting)</h3>
          <ForecastCard forecast={forecast} />
        </div>
      </div>

      {/* ====== Linha: Conversão por Fonte (grande) e Resumo Analítico ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Conversão por Fonte</h3>
          <div style={{ height: 260 }}>
            <ConversionChart data={conversionBySource} />
          </div>

          {/* Resumo de Produtividade detalhado (abaixo do gráfico) */}
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium mb-3">Resumo de Produtividade</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Leads Ativos</p>
                  <p className="font-bold text-lg">{(productivity.leadsActive || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendas Concluídas (Qtd)</p>
                  <p className="font-bold text-lg">{(productivity.totalWonCount || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Total de Vendas</p>
                  <p className="font-bold text-lg">{productivity.totalWonValue ? `R$ ${Number(productivity.totalWonValue).toLocaleString('pt-BR')}` : 'R$ 0,00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taxa de Conversão</p>
                  <p className="font-bold text-lg">{formatPercent(productivity.conversionRate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Perdas + Observações */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <h3 className="text-lg font-semibold">Detalhes e Perdas</h3>
          <div>
            <LostReasonsTable data={lostLeads} />
          </div>

          <div>
            <AnalyticNotes notes={analyticNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;
