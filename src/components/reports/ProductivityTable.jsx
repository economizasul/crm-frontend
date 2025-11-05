// src/components/reports/ProductivityTable.jsx

import React from 'react';

/**
 * Componente de Tabela que exibe as métricas de produtividade do(s) vendedor(es).
 * @param {Object} metrics - Objeto contendo métricas agregadas (data.productivity).
 */
function ProductivityTable({ metrics }) {
    
    // Fallback para garantir que o componente não quebre se não houver dados
    if (!metrics) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Métricas de Produtividade</h2>
                <div className="text-gray-500 p-4">Nenhuma métrica de produtividade disponível ou filtros não aplicados.</div>
            </div>
        );
    }

    // Função auxiliar para formatar valores monetários (R$)
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    // Função auxiliar para formatar porcentagens (%)
    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        // Multiplica por 100, formata para duas casas decimais e adiciona %
        return `${(value * 100).toFixed(2).replace('.', ',')}%`;
    };
    
    // Função auxiliar para formatar dias
    const formatDays = (value) => {
        if (value === undefined || value === null) return '0 dias';
        return `${parseFloat(value).toFixed(1).replace('.', ',')} dias`;
    };

    // Mapeamento das métricas para exibição na tabela
    const metricsDisplay = [
        { 
            label: "Total de Leads Ativos", 
            value: metrics.leadsActive, 
            format: (v) => v.toLocaleString('pt-BR'),
            description: "Leads que não foram Convertidos ou Perdidos."
        },
        { 
            label: "Total de Vendas Concluídas (Qtd)", 
            value: metrics.totalWonCount, 
            format: (v) => v.toLocaleString('pt-BR'),
            description: "Número total de Leads convertidos em Clientes no período."
        },
        { 
            label: "Valor Total de Vendas", 
            value: metrics.totalWonValue, 
            format: formatCurrency,
            description: "Soma das economias estimadas dos Leads convertidos."
        },
        { 
            label: "Taxa de Conversão", 
            value: metrics.conversionRate, 
            format: formatPercent,
            description: "Proporção de Leads convertidos (Ganhos / Total Leads)."
        },
        { 
            label: "Taxa de Perda", 
            value: metrics.lossRate, 
            format: formatPercent,
            description: "Proporção de Leads perdidos (Perdidos / Total Leads)."
        },
        { 
            label: "Tempo Médio de Fechamento", 
            value: metrics.avgClosingTimeDays, 
            format: formatDays,
            description: "Média de dias entre a criação e a conversão do Lead."
        },
    ];

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold mb-0 p-4 border-b text-gray-800">Métricas de Produtividade</h2>
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