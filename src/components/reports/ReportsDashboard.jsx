// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import KPICard from './KPICard';
import ProductivityTable from './ProductivityTable';
import ConversionChart from './ConversionChart';
import { FaChartLine, FaBolt, FaHandshake, FaHourglassHalf } from 'react-icons/fa';

/**
 * ReportsDashboard
 * Recebe `data` (object) com a forma:
 * {
 *   productivity: { totalLeads, leadsActive, totalWonCount, totalLostCount, totalWonValueKW, conversionRate, lossRate, avgClosingTimeDays },
 *   conversionBySource: [{ source, totalLeads, wonLeads, conversionRate }]
 * }
 */
function ReportsDashboard({ data, loading, error }) {
  if (loading && !data) {
    return <div className="text-center p-8 text-xl text-indigo-600">Carregando métricas do Dashboard...</div>;
  }
  if (error) {
    return <div className="text-center p-8 text-xl text-red-600 border border-red-300 bg-red-50 rounded-lg">Erro ao carregar dados: {String(error)}</div>;
  }
  if (!data) {
    return <div className="text-center p-8 text-xl text-gray-500 border border-gray-300 bg-gray-50 rounded-lg">Aplique filtros para carregar o relatório.</div>;
  }

  const { productivity = {}, conversionBySource = [] } = data;

  const formatPercent = (value) => {
    if (value === undefined || value === null) return '0,0%';
    return `${(value * 100).toFixed(1).replace('.', ',')}%`;
  };

  const formatKW = (value) => {
    if (value === undefined || value === null) return '0,00 kW';
    const n = Number(value) || 0;
    return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;
  };

  const kpiMetrics = [
    {
      title: "Valor Total (kW)",
      value: formatKW(productivity.totalWonValueKW),
      description: "Total de consumo (kW) dos leads convertidos.",
      Icon: FaBolt
    },
    {
      title: "Taxa de Conversão",
      value: formatPercent(productivity.conversionRate),
      description: "Leads convertidos / Total de leads.",
      Icon: FaHandshake
    },
    {
      title: "Leads Ativos",
      value: (productivity.leadsActive || 0).toLocaleString('pt-BR'),
      description: "Leads nas fases ativas (não Ganho / não Perdido).",
      Icon: FaChartLine
    },
    {
      title: "Tempo Médio de Fechamento",
      value: `${(productivity.avgClosingTimeDays || 0).toFixed(1).replace('.', ',')} dias`,
      description: "Média de dias desde o cadastro até o Ganho.",
      Icon: FaHourglassHalf
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((m, i) => (
          <KPICard key={i} title={m.title} value={m.value} description={m.description} Icon={m.Icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Resumo de Produtividade</h2>
          <ProductivityTable metrics={productivity} />
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Conversão por Fonte</h2>
          <ConversionChart data={conversionBySource} />
          {(!conversionBySource || conversionBySource.length === 0) && (
            <p className="text-sm text-gray-500 mt-4">Sem dados de conversão por fonte para o período.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;
