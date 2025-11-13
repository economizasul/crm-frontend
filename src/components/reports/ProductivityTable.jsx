// src/components/reports/ProductivityTable.jsx (COMPLETO E CORRIGIDO)

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

    // Função auxiliar para formatar valores
    const formatNumber = (value) => Number(value ?? 0).toLocaleString('pt-BR');
    
    // Função auxiliar para formatar KW (com duas casas decimais para precisão)
    const formatKw = (value) => {
        if (value === undefined || value === null) return '0,00 KW';
        return `${parseFloat(value ?? 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')} KW`;
    };

    // Função auxiliar para formatar porcentagens
    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0,00%';
        // Multiplica por 100, formata para duas casas decimais e adiciona %
        return `${(value * 100).toFixed(2).replace('.', ',')}%`;
    };

    // Mapeamento das métricas para exibição na tabela
    const metricsDisplay = [
        { 
            label: "Leads Ativos", 
            value: metrics.leadsActive,
            format: formatNumber,
            description: "Total de leads que ainda não foram Ganho ou Perdido no período do filtro."
        },
        { 
            label: "Vendas Concluídas (Qtd)", 
            value: metrics.totalWonCount,
            format: formatNumber,
            description: "Número de leads com status 'Ganho' no período."
        },
        { 
            label: "Valor Total (kW)", 
            value: metrics.totalWonValueKW,
            format: formatKw,
            description: "Soma do consumo médio (avg_consumption) dos leads 'Ganho' no período."
        },
        { 
            label: "Taxa de Conversão", 
            value: metrics.conversionRate,
            format: formatPercent,
            description: "Porcentagem de leads 'Ganho' em relação aos leads Ganho + Perdido no período."
        },
        { 
            label: "Taxa de Perda", 
            value: metrics.lossRate,
            format: formatPercent,
            description: "Porcentagem de leads 'Perdido' em relação aos leads Ganho + Perdido no período."
        },
        { 
            label: "Tempo Médio de Fechamento", 
            value: metrics.avgClosingTimeDays,
            format: (value) => `${Number(value ?? 0).toFixed(1).replace('.', ',')} dias`,
            description: "Média de dias entre created_at e updated_at para leads 'Ganho' no período."
        },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Métricas de Produtividade (Filtradas)</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
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