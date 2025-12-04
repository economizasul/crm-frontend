// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportsDashboard = ({ data = {}, loading }) => {
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando relatório...</div>;
  }

  // PROTEÇÃO TOTAL: pega os dados com fallback seguro
  const funnelOrigins = Array.isArray(data.funnelOrigins) ? data.funnelOrigins : [];
  const originStats = data.originStats || {};
  const lostReasonsData = data.lostReasons || { reasons: [], totalLost: 0 };
  const lostReasons = Array.isArray(lostReasonsData.reasons) ? lostReasonsData.reasons : [];

  // === 1. ORIGEM DO LEAD (usa funnelOrigins se existir, senão converte originStats) ===
  const originData = funnelOrigins.length > 0
    ? funnelOrigins.map(item => ({
        name: item.origin || 'Não informado',
        value: item.count || 0
      }))
    : Object.entries(originStats).map(([origin, count]) => ({
        name: origin || 'Não informado',
        value: Number(count) || 0
      }));

  // === 2. MOTIVOS DE PERDA (já vem certinho do backend com "..:") ===
  const lostData = lostReasons.map(item => ({
    motivo: item.reason || 'Outro',
    quantidade: item.count || 0,
    percentual: Number(item.percentage || 0).toFixed(1)
  }));

  // Tooltip bonito
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const { motivo, quantidade, percentual } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
          <p className="font-bold">{motivo}</p>
          <p>{quantidade} leads • {percentual}%</p>
        </div>
      );
    }
    return null;
  };

  // Label dentro da barra (quantidade • %)
  const CustomLabel = ({ x, y, width, height, value, payload }) => {
    if (width < 50) return null;
    return (
      <text x={x + width - 10} y={y + height / 2} fill="#fff" textAnchor="end" dominantBaseline="middle" fontSize="13" fontWeight="bold">
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
          <p className="text-gray-500 text-center py-12">Nenhum dado de origem no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(240, originData.length * 60)}>
            <BarChart data={originData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 13 }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* GRÁFICO MOTIVOS DE PERDA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Motivos de Perda {lostReasonsData.totalLost > 0 && `(${lostReasonsData.totalLost} leads perdidos)`}
        </h3>
        {lostData.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Nenhum lead perdido no período</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, lostData.length * 60)}>
            <BarChart data={lostData} layout="horizontal" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'dataMax + 5']} />
              <YAxis dataKey="motivo" type="category" width={200} tick={{ fontSize: 13, fontWeight: 'bold' }} />
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