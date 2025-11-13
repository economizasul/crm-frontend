// src/components/reports/FunnelChart.jsx

import React from 'react';
import { FaFilter } from 'react-icons/fa';

/**
 * Componente que exibe a distribuição de leads pelo Funil de Vendas.
 * Atualmente um placeholder para futura integração com biblioteca de gráficos.
 * @param {Array} funnelData - Array de objetos representando as fases do funil. (Renomeado para funnelData para consistência com o hook)
 */
function FunnelChart({ funnelData: funnelStages }) {
    
    if (!funnelStages || funnelStages.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-96 flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado de funil encontrado.</p>
            </div>
        );
    }
    
    // Calcula o total de leads (ou kW) no funil para percentuais
    const totalLeads = funnelStages.reduce((sum, stage) => sum + stage.count, 0);

    // Mapeamento simples de cores para as etapas
    const stageColors = {
        'Primeiro Contato': 'bg-indigo-500',
        'Qualificação': 'bg-blue-500',
        'Proposta': 'bg-cyan-500',
        'Negociação': 'bg-teal-500',
        'Fechado Ganho': 'bg-green-600',
        'Fechado Perdido': 'bg-red-500',
        'Outros': 'bg-gray-400',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center">
                <FaFilter className="mr-2 text-orange-500" />
                Funil de Vendas por Etapa
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">Total de Leads {totalLeads > 0 ? `(${totalLeads.toLocaleString('pt-BR')})` : ''}</p>

            <div className="space-y-4">
                {funnelStages.map((stage, index) => {
                    // O backend retorna stageName e count. Assumo que stageName é o nome da fase.
                    const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;
                    const color = stageColors[stage.stageName] || stageColors['Outros'];
                    
                    return (
                        <div key={stage.stageName} className="relative">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                    {stage.stageName}
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    {stage.count.toLocaleString('pt-BR')} ({percentage.toFixed(1).replace('.', ',')}%)
                                </span>
                            </div>
                            
                            {/* Barra de Progresso Simples (Simulação Visual do Funil) */}
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className={`${color} h-3 rounded-full transition-all duration-500`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-500 mt-6 pt-4 border-t">
                * Modelo de visualização que pode ser substituído por um gráfico real futuramente.
            </p>
        </div>
    );
}

export default FunnelChart;