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

    // Função auxiliar para formatar valores em KW
    const formatKw = (value) => {
        if (value === undefined || value === null) return '0,00 KW';
        // Formata o número (ex: 12345.67 -> 12.345,67 KW)
        return `${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} KW`;
    };

    // Função auxiliar para formatar porcentagens
    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        // Assume que o valor é de 0 a 1 e multiplica por 100, ou ajusta se já for % (0 a 100)
        let percentage = (value <= 1) ? value * 100 : value;
        return `${percentage.toFixed(2).replace('.', ',')}%`;
    };

    // Mapeamento das métricas para exibição na tabela
    const metricsDisplay = [
        { 
            label: "Leads Ativos", 
            value: metrics.leadsActive, 
            format: (v) => (v ?? 0).toLocaleString('pt-BR'), 
            description: "Total de leads no funil (status diferente de Ganho/Perdido)." 
        },
        { 
            label: "Vendas Concluídas (Qtd)", 
            value: metrics.totalWonCount, 
            format: (v) => (v ?? 0).toLocaleString('pt-BR'), 
            description: "Número total de projetos fechados como 'Ganho'." 
        },
        { 
            label: "Valor Total (kW)", 
            value: metrics.totalWonValueKW, 
            format: formatKw, 
            description: "Soma da potência (kW) de todos os projetos ganhos." 
        },
        { 
            label: "Taxa de Conversão", 
            value: metrics.conversionRate, 
            format: formatPercent, 
            description: "Porcentagem de leads que se tornaram 'Ganho'." 
        },
        { 
            label: "Taxa de Perda", 
            value: metrics.lossRate, 
            format: formatPercent, 
            description: "Porcentagem de leads que se tornaram 'Perdido'." 
        },
        { 
            label: "Tempo Médio de Fechamento", 
            value: metrics.avgClosingTimeDays, 
            format: (v) => (v ?? 0).toFixed(1).replace('.', ',') + ' dias', 
            description: "Média de dias desde a criação até o status 'Ganho'." 
        },
    ];

    return (
        // ESTILIZAÇÃO PADRÃO: p-6, rounded-2xl, shadow-md, border
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Métricas de Produtividade</h3>
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