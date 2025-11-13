// src/components/reports/LostReasonsTable.jsx

import React from 'react';

/**
 * Componente de Tabela que exibe a análise dos motivos de perda (Churn).
 * @param {Object} lostLeadsAnalysis - Objeto contendo a análise dos motivos de perda.
 */
function LostReasonsTable({ lostLeadsAnalysis }) {
    
    if (!lostLeadsAnalysis || lostLeadsAnalysis.totalLost === 0) {
        return (
            // ESTILIZAÇÃO PADRÃO: p-6, rounded-2xl, shadow-md, border
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Análise de Motivos de Perda</h3>
                <div className="text-gray-500 p-8 text-center">
                    Nenhum lead perdido no período selecionado.
                </div>
            </div>
        );
    }
    
    const { reasons, totalLost } = lostLeadsAnalysis;

    // Função auxiliar para formatar porcentagens
    const formatPercent = (value) => {
        if (value === undefined || value === null || totalLost === 0) return '0%';
        // Calcula a porcentagem do total e formata
        const percentage = (value / totalLost) * 100;
        return `${percentage.toFixed(1).replace('.', ',')}%`;
    };

    return (
        // ESTILIZAÇÃO PADRÃO: p-6, rounded-2xl, shadow-md, border
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Análise de Motivos de Perda</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Motivo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantidade
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                % do Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reasons.map((item, index) => (
                            <tr key={item.reason} className="hover:bg-red-50/50">
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.reason || 'Motivo Não Especificado'}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                    {item.count.toLocaleString('pt-BR')}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                                    {formatPercent(item.count)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LostReasonsTable;