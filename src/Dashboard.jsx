// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportsDashboard = ({ data, loading }) => {
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando relatório...</div>;
  }

  const {
    funnelOrigins = [],
    lostReasons = { reasons: [], totalLost: 0 },
    globalSummary = {}
  } = data;

  // === 1. FUNIL DE ORIGEM DO LEAD ===
  const originData = funnelOrigins.map(item => ({
    name: item.origin || 'Não informado',
    value: item.count
  }));

  // === 2. GRÁFICO MOTIVOS DE PERDA COM "..:" e % dentro da barra ===
  const lostData = (lostReasons.reasons || []).map(item => ({
    motivo: item.reason,
    quantidade: item.count,
    percentual: item.percentage
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.motivo}</p>
          <p className="text-sm">{payload[0].value} leads • {payload[0].payload.percentual}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props) => {
    const { x, y, width, height, value, payload } = props;
    if (width < 60) return null; // evita texto em barras pequenas
    return (
      <text x={x + width - 8} y={y + height / 2} fill="#fff" textAnchor="end" dominantBaseline="middle" fontSize="12" fontWeight="bold">
        {value} • {payload.percentual}%
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* FUNIL ORIGEM DO LEAD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Origem dos Leads</h3>
        {originData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum lead encontrado no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, originData.length * 50)}>
            <BarChart data={originData} layout="horizontal" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* GRÁFICO MOTIVOS DE PERDA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Motivos de Perda</h3>
        {lostData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum lead perdido no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(280, lostData.length * 55)}>
            <BarChart data={lostData} layout="horizontal" margin={{ left: 180 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'dataMax + 5']} />
              <YAxis dataKey="motivo" type="category" width={170} tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantidade" fill="#ef4444" radius={[0, 8, 8, 0]} label={<CustomLabel />} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;