// src/components/reports/LostReasonsTable.jsx

import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

/**
 * Componente de Tabela que exibe a análise dos motivos de perda (Churn).
 * @param {Object} lostReasonsData - Objeto contendo a análise dos motivos de perda.
 */
function LostReasonsTable({ lostReasonsData }) {
    
    // 🟢 CORREÇÃO: Garante acesso seguro a reasons e totalLost, com fallback
    const reasons = lostReasonsData?.reasons || [];
    const totalLost = lostReasonsData?.totalLost || 0;
    
    if (totalLost === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <FaTimesCircle className="mr-2 text-red-600" />
                    Análise de Motivos de Perda
                </h3>
                <div className="text-gray-500 p-8 text-center">
                    Nenhum lead perdido no período selecionado.
                </div>
            </div>
        );
    }
    
    // Função auxiliar para formatar porcentagens
    const formatPercent = (value) => {
        // 🟢 CORREÇÃO: Garante que o valor e o totalLost são seguros
        if (value === undefined || value === null || totalLost === 0) return '0%';
        // Calcula a porcentagem do total e formata
        const percentage = (value / totalLost) * 100;
        return `${percentage.toFixed(1).replace('.', ',')}%`;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <FaTimesCircle className="mr-2 text-red-600" />
                Análise de Motivos de Perda (Total: {totalLost.toLocaleString('pt-BR')})
            </h3>
            
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
                            <tr key={item.reason || index} className="hover:bg-red-50/50">
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.reason || 'Motivo Não Especificado'}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                                    {/* 🟢 Garante que item.count existe para formatar */}
                                    {(item.count ?? 0).toLocaleString('pt-BR')}
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