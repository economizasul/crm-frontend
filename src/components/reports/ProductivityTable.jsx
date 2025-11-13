// src/components/reports/ProductivityTable.jsx

import React from 'react';

/**
 * Componente de Tabela que exibe as métricas de produtividade do(s) vendedor(es).
 * @param {Object} metrics - Objeto contendo métricas agregadas (do ReportDataService).
 */
function ProductivityTable({ metrics }) {
    
    // Fallback para garantir que o componente não quebre se não houver dados
    if (!metrics) {
        return <div className="text-gray-500 p-4">Nenhuma métrica de produtividade disponível.</div>;
    }

    // Função auxiliar para formatar valores monetários (ajustado para o novo campo KW do backend)
    const formatKw = (value) => {
        if (value === undefined || value === null) return '0,00 KW';
        // Formata o número (ex: 12345.67 -> 12.345,67 KW)
        return `${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} KW`;
    };

    // Função auxiliar para formatar porcentagens
    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        // Multiplica por 100, formata para duas casas decimais e adiciona %
        // Nota: O backend já está retornando a conversão em % (0 a 100).
        // Se o backend retorna 0.85 (85%), use: return `${(value * 100).toFixed(2).replace('.', ',')}%`;
        // Se o backend retorna 85 (85%), use: 
        return `${parseFloat(value).toFixed(2).replace('.', ',')}%`;
    };

    // Mapeamento das métricas para exibição na tabela
    // Nota: A estrutura do componente (metrics) deve ser alinhada com os dados do ReportDataService.
    const metricsDisplay = [
        { 
            label: "Leads Ativos", 
            // O ReportDataService retorna a produtividade como um array. 
            // Aqui você deve usar productivityData.totalLeadsPeriod ou similar
            value: metrics.leadsActive, 
            format: (v) => v ? v.toLocaleString('pt-BR') : 0,
            description: "Total de leads nas fases de Atendimento/Negociação no período."
        },
        { 
            label: "Vendas Concluídas (Qtd)", 
            value: metrics.totalWonCount, 
            format: (v) => v ? v.toLocaleString('pt-BR') : 0,
            description: "Número total de leads movidos para a fase 'Fechado Ganho'."
        },
        { 
            label: "Valor Total de Vendas", 
            value: metrics.totalWonValue, 
            format: formatKw,
            description: "Valor (kW) total das vendas concluídas."
        },
        { 
            label: "Taxa de Conversão (Lead -> Venda)", 
            value: metrics.conversionRate, 
            format: formatPercent,
            description: "Proporção de leads que se converteram em vendas."
        },
        { 
            label: "Tempo Médio de Fechamento", 
            value: metrics.avgClosingTimeDays, 
            format: (v) => v ? `${v.toFixed(1)} dias` : 'N/A',
            description: "Média de dias desde o Primeiro Contato até o Fechamento."
        },
        { 
            label: "Taxa de Perda (Churn Rate)", 
            value: metrics.lossRate, 
            format: formatPercent,
            description: "Proporção de leads movidos para a fase 'Perdido'."
        },
    ];

    // Se estiver usando o array de vendedores:
    const vendorData = Array.isArray(metrics) ? metrics : [
        // Se o componente for reescrito para listar vendedores, esta linha será removida.
        // Por enquanto, mantenho o mapeamento para não quebrar o layout.
        { vendorName: 'Geral', ...metricsDisplay.reduce((acc, curr) => ({...acc, [curr.label]: curr.format(curr.value)}), {}) }
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Produtividade de Vendas</h3>
            <div className="overflow-x-auto">
                {/* O componente original que você forneceu estava formatado como uma Tabela de Métricas em vez de Tabela de Vendedores. 
                    Recomendação: Mantenha esta tabela se ela for apenas o resumo geral. Se for a tabela de vendedores, use um cabeçalho diferente. 
                    Vou usar o formato que você forneceu.
                */}
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