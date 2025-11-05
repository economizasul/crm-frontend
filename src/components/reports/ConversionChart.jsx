// src/components/reports/ConversionChart.jsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Componente de Gráfico de Donut que exibe a taxa de Leads Convertidos por Fonte.
 * @param {Array<Object>} data - Array de objetos: [{ source, convertedCount, activeCount, conversionRate }, ...]
 */
function ConversionChart({ data }) {
    
    // Fallback
    if (!data || data.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <p className="text-lg">Sem dados de conversão por fonte para o período.</p>
                <p className="text-sm mt-2">Tente ajustar os filtros ou aguarde por mais leads.</p>
            </div>
        );
    }
    
    // Gerar cores semi-aleatórias para as fatias
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];
    
    // Mapeia os dados da API para o formato que o Recharts espera para um PieChart
    // Usaremos o número de leads convertidos para o tamanho da fatia
    const chartData = data
        .filter(item => item.convertedCount > 0) // Filtra fontes sem conversões
        .map((item, index) => ({
            name: item.source,
            value: item.convertedCount, // O valor é o número de leads convertidos
            rate: item.conversionRate, // Mantemos a taxa para o Tooltip
            color: COLORS[index % COLORS.length]
        }));
        
    // Se não houver dados convertidos
    if (chartData.length === 0) {
         return (
            <div className="text-center p-8 text-gray-500">
                <p className="text-lg">Nenhuma conversão registrada neste período.</p>
                <p className="text-sm mt-2">Aguardando a primeira venda!</p>
            </div>
        );
    }

    // Componente Customizado para o Tooltip (exibe os dados formatados ao passar o mouse)
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-300 shadow-lg rounded-md text-sm">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-gray-700 mt-1">Leads Convertidos: <span className="font-bold">{item.value.toLocaleString('pt-BR')}</span></p>
                    <p className="text-gray-700">Taxa de Conversão: <span className="font-bold text-indigo-600">{(item.rate * 100).toFixed(1).replace('.', ',')}%</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        // ResponsiveContainer garante que o gráfico se ajuste ao tamanho do seu container pai
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%" // Centro X
                    cy="50%" // Centro Y
                    innerRadius={60} // Raio interno (cria o efeito de donut)
                    outerRadius={100} // Raio externo
                    fill="#8884d8"
                    paddingAngle={3} // Espaço entre as fatias
                    dataKey="value" // Campo de valor (tamanho da fatia)
                    nameKey="name" // Campo de nome (rótulo)
                    labelLine={false} // Oculta linhas de rótulo
                >
                    {/* Cria as fatias do gráfico com cores dinâmicas */}
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
}

export default ConversionChart;