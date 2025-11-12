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
 * ReportsDashboard (layout modernizado / tema EconomizaSul)
 * Compatível com os dados provindos de useReports.
 */
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

  const { productivity = {}, conversionBySource = [], responseMetrics = {}, activities = [], forecast = {}, lostLeads = [], analyticNotes = [] } = data;

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

  const ResponseChart = ({ data }) => (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => v} />
          <Tooltip />
          <Line type="monotone" dataKey="avgRespHours" stroke="#1A7F3C" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="replies" stroke="#E57C23" strokeWidth={2} dot={false} />
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
          <Bar dataKey="calls" stackId="a" fill="#1A7F3C" />
          <Bar dataKey="emails" stackId="a" fill="#28A745" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((m, i) => (
          <div key={i} className="transform hover:-translate-y-0.5 transition">
            <KPICard
              title={m.title}
              value={m.value}
              description={m.description}
              Icon={m.Icon}
              // KPICard usa estilos próprios; o container acima aplica shadow/hover
            />
          </div>
        ))}
      </div>

      {/* Linha: Produtividade (2/3) e Painel direito (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Relatório de Produtividade do Vendedor</h2>
            <div className="text-sm text-gray-500">Resumo por vendedor</div>
          </div>
          <ProductivityTable metrics={productivity} />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-md font-medium mb-2">Taxa de Réplica / Tempo de Resposta (Horas)</h3>
            <ResponseChart data={responseSeries} />
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-md font-medium mb-2">Análise de Funil por Origem de Lead</h3>
            <div style={{ height: 220 }}>
              <FunnelChart data={conversionBySource} />
            </div>
          </div>
        </div>
      </div>

      {/* Linha: Engajamento e Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-4">Relatório de Resposta e Engajamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-sm text-gray-600 mb-2">Ações Registradas por Vendedor (Últimas 4 Semanas)</p>
              <ActionsByVendorChart data={actionsSeries} />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-sm text-gray-600 mb-2">Evolução de Ações</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={actionsSeries} margin={{ top: 6, right: 8, left: -12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#1A7F3C" dot={false} />
                  <Line type="monotone" dataKey="emails" stroke="#28A745" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-4">Relatório de Previsão de Vendas (Forecasting)</h3>
          <ForecastCard forecast={forecast} />
        </div>
      </div>

      {/* Conversão por Fonte e Painel direito (Perdas e Notas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-4">Conversão por Fonte</h3>
          <div style={{ height: 300 }}>
            <ConversionChart data={conversionBySource} />
          </div>

          <div className="mt-6 bg-gray-50 rounded-xl p-4 border">
            <h4 className="font-medium mb-2">Resumo de Produtividade</h4>
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

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition space-y-6">
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
