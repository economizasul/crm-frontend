// src/components/reports/ReportsDashboard.jsx

import React from 'react';
import {
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const STATUS_ORDER = ['Novo', 'Primeiro Contato', 'Retorno Agendado', 'Em Negociação', 'Proposta Enviada', 'Ganho', 'Perdido'];
const FUNNEL_COLORS = ['#A3D4FF', '#74BDE9', '#4CA3D5', '#3A8FB9', '#2C6E91', '#1A4D67', '#FF6B6B'];

const ReportsDashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center p-10 font-medium text-gray-500">
        Carregando dados do dashboard...
      </div>
    );
  }

  // Defensive defaults
  const rawFunnelData = Array.isArray(data.funnelData) ? data.funnelData : [];
  const lossReasonsRaw = Array.isArray(data.lossReasons) ? data.lossReasons : [];
  const sellerPerformance = Array.isArray(data.sellerPerformance) ? data.sellerPerformance : [];
  const originAnalysis = Array.isArray(data.originAnalysis) ? data.originAnalysis : [];

  // Process funnel
  const processedFunnel = [];
  let totalLeads = 0;
  let previousCount = 0;

  for (const status of STATUS_ORDER) {
    const item = rawFunnelData.find(d => d.status === status);
    const count = item ? Number(item.count || 0) : 0;

    if (status === 'Novo') totalLeads = count;

    let conversionRate = 0;
    if (previousCount > 0) conversionRate = (count / previousCount) * 100;

    processedFunnel.push({
      status,
      count,
      conversionRate: conversionRate.toFixed(1)
    });

    if (status !== 'Perdido') previousCount = count;
  }

  const reversedFunnel = processedFunnel.filter(d => d.count > 0).reverse();

  // Loss reasons for pie
  const lossReasonsData = lossReasonsRaw.map(item => ({
    name: item.reason || 'Desconhecido',
    value: Number(item.count || 0)
  })).filter(x => x.value > 0);

  // Helper time format
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins} min`;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-blue-800">Novos Leads</p>
            <p className="text-3xl font-bold text-blue-900">{Number(data.newLeads || 0)}</p>
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-green-800">Taxa de Conversão Geral</p>
            <p className="text-3xl font-bold text-green-900">{data.conversionRate || '0%'}</p>
          </div>
        </div>

        <div className="bg-yellow-100 p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-yellow-800">Tempo Médio de Resposta</p>
            <p className="text-3xl font-bold text-yellow-900">{formatTime(data.avgResponseTime)}</p>
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-purple-800">Valor em Negociação</p>
            <p className="text-3xl font-bold text-purple-900">R$ {(Number(data.totalValueInNegotiation || 0)).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Funil de Vendas (Pipeline)</h2>
          <div className="h-96 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={reversedFunnel}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                barCategoryGap="0%"
                stackOffset="sign"
              >
                <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} width={140} />
                <XAxis type="number" hide domain={[0, totalLeads || 1]} />
                <Tooltip formatter={(value) => [`Leads: ${value}`]} />
                <Bar dataKey="count" isAnimationActive={false}>
                  {reversedFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[STATUS_ORDER.indexOf(entry.status) % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Performance Individual dos Vendedores</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads Ativos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas Ganhas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa Conv.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo Fecham.</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellerPerformance.map((seller, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seller.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.activeLeads || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.wonLeads || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">{seller.conversionRate || '0%'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.avgTimeToClose || 0} dias</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Análise de Conversão por Origem</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originAnalysis}>
                <XAxis dataKey="origin" stroke="#888888" interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => [value, name]} />
                <Bar yAxisId="left" dataKey="totalLeads" fill="#8884d8" name="Total de Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Principais Razões de Perda</h2>
          <div className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lossReasonsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {lossReasonsData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={['#FF6B6B', '#FFAA6B', '#FFD86B', '#A2FF6B', '#6BFFCE'][idx % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
