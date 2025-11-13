// src/components/reports/ProductivityTable.jsx

import React from 'react';

/**
 * Componente de Tabela que exibe as métricas de produtividade do(s) vendedor(es).
 * @param {Object} metrics - Objeto contendo métricas agregadas (do ReportDataService).
 */
function ProductivityTable({ metrics }) {
    
    // Fallback para garantir que o componente não quebre se não houver dados
    if (!metrics) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Produtividade de Vendas</h3>
                <div className="text-gray-500 p-4">Nenhuma métrica de produtividade disponível.</div>
            </div>
        );
    }

    // Função auxiliar para formatar valores em kW (Backend retorna 'totalKwWon')
    const formatKw = (value) => {
        // 🟢 CORREÇÃO: Garante que o valor é um número ou 0
        const num = parseFloat(value ?? 0);
        if (isNaN(num)) return '0,00 KW';
        
        // Formata o número (ex: 12345.67 -> 12.345,67 KW)
        return `${num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} KW`;
    };

    // Função auxiliar para formatar porcentagens (Backend retorna 0-100)
    const formatPercent = (value) => {
        // 🟢 CORREÇÃO: Garante que o valor é um número ou 0
        const num = parseFloat(value ?? 0);
        if (isNaN(num)) return '0%';
        
        // Formata para duas casas decimais e adiciona %
        return `${num.toFixed(2).replace('.', ',')}%`;
    };

    // Função auxiliar para formatar contagem de leads
    const formatCount = (value) => {
        // 🟢 CORREÇÃO: Garante que o valor é um número ou 0
        const num = parseInt(value ?? 0, 10);
        if (isNaN(num)) return 0;
        
        return num.toLocaleString('pt-BR');
    };

    // Função auxiliar para formatar tempo em dias
    const formatDays = (value) => {
        // 🟢 CORREÇÃO: Garante que o valor é um número ou 0
        const num = parseFloat(value ?? 0);
        if (isNaN(num)) return 'N/A';
        
        return `${num.toFixed(1).replace('.', ',')} dias`;
    };

    // Mapeamento das métricas para exibição na tabela, usando os nomes do ReportDataService (Backend)
    const metricsDisplay = [
        { 
            label: "Leads Ativos", 
            value: metrics.activeLeads, // Nome do Backend
            format: formatCount,
            description: "Total de leads nas fases de Atendimento/Negociação no período."
        },
        { 
            label: "Vendas Concluídas (Qtd)", 
            value: metrics.totalWonQty, // Nome do Backend
            format: formatCount,
            description: "Número total de leads movidos para a fase 'Fechado Ganho'."
        },
        { 
            label: "Valor Total de Vendas", 
            value: metrics.totalKwWon, // Nome do Backend
            format: formatKw,
            description: "Valor (kW) total das vendas concluídas."
        },
        { 
            label: "Taxa de Conversão (Total)", 
            value: metrics.conversionRate, // Nome do Backend
            format: formatPercent,
            description: "Proporção de leads (Fechados) que se converteram em vendas."
        },
        { 
            label: "Tempo Médio de Fechamento", 
            value: metrics.avgTimeToWinDays, // Nome do Backend
            format: formatDays,
            description: "Média de dias desde a criação até o Fechamento Ganho."
        },
        { 
            label: "Taxa de Perda (Churn Rate)", 
            value: metrics.churnRate, // Nome do Backend
            format: formatPercent,
            description: "Proporção de leads movidos para a fase 'Fechado Perdido'."
        },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Produtividade de Vendas</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Métrica
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Descrição
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {metricsDisplay.map((metric, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {metric.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                    {metric.format(metric.value)}
                                </td>
                                <td className="px-6 py-4 whitespace-normal text-xs text-gray-500 hidden sm:table-cell">
                                    {metric.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductivityTable;