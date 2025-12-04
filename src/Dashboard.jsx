// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ReportsDashboard = ({ data = {}, loading = false }) => {
  // Proteção total contra undefined
  const originStats = data.originStats || {};
  const lostReasons = data.lostReasons || { reasons: [], totalLost: 0 };
  const reasonsArray = Array.isArray(lostReasons.reasons) ? lostReasons.reasons : [];

  // Converte originStats (objeto) → array para o gráfico
  const originData = Object.entries(originStats)
    .map(([origin, count]) => ({
      name: origin === 'null' || !origin ? 'Não informado' : origin,
      value: Number(count) || 0
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Dados do gráfico de perda
  const lostData = reasonsArray
    .map(item => ({
      motivo: item.reason || 'Outro',
      quantidade: item.count || 0,
      percentual: Number(item.percentage || 0).toFixed(1)
    }))
    .filter(item => item.quantidade > 0);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-gray-800">{payload[0].payload.motivo || payload[0].payload.name}</p>
          <p className="text-gray-600">{payload[0].value} leads</p>
          {payload[0].payload.percentual && <p className="text-gray-600">{payload[0].payload.percentual}% do total</p>}
        </div>
      );
    }
    return null;
  };

  // Label dentro da barra
  const CustomLabel = (props) => {
    const { x, y, width, height, value, payload } = props;
    if (width < 60) return null;
    const text = payload.percentual ? `${value} • ${payload.percentual}%` : value;
    return (
      <text x={x + width - 10} y={y + height / 2} fill="#fff" textAnchor="end" dominantBaseline="middle" fontSize="13" fontWeight="bold">
        {text}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* ORIGEM DOS LEADS */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Origem dos Leads</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Carregando origens...</div>
          </div>
        ) : originData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum lead com origem registrada no período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, originData.length * 60)}>
            <BarChart data={originData} layout="horizontal" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 13 }} stroke="#444" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {originData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* MOTIVOS DE PERDA */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Motivos de Perda {lostReasons.totalLost > 0 && `(${lostReasons.totalLost} perdidos)`}
        </h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Carregando motivos...</div>
          </div>
        ) : lostData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhum lead perdido no período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, lostData.length * 65)}>
            <BarChart data={lostData} layout="horizontal" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="motivo" type="category" width={220} tick={{ fontSize: 13, fontWeight: 'bold' }} stroke="#444" />
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