// src/components/reports/FunnelChart.jsx

import React from 'react';

/**
 * Componente que exibe a distribuição de leads pelo Funil de Vendas.
 * @param {Array} funnelStages - Array de objetos representando as fases do funil (do backend).
 */
function FunnelChart({ funnelStages }) { // 🟢 Nome da prop corrigido para funnelStages
    
    if (!funnelStages || funnelStages.length === 0) {
        return (
            <div className="h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Funil de Vendas</h3>
                <p className="text-gray-500">Nenhum dado de funil encontrado.</p>
            </div>
        );
    }
    
    const totalLeads = funnelStages.reduce((sum, stage) => sum + stage.count, 0);

    // Mapeamento de cores para as etapas
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
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-6 text-gray-700">Funil de Vendas</h3>
            
            <div className="flex flex-col space-y-5 flex-grow">
                {/* Filtra estágios com 0 leads para não renderizar no funil */}
                {funnelStages.filter(stage => stage.count > 0).map((stage) => {
                    const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;
                    const color = stageColors[stage.stageName] || stageColors['Outros'];
                    
                    return (
                        <div key={stage.stageName} className="relative">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                    {stage.stageName}
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    {stage.count.toLocaleString('pt-BR')} ({percentage.toFixed(1).replace('.', ',')}% Total)
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
                * Percentual em relação ao total de leads no período ({totalLeads.toLocaleString('pt-BR')}).
            </p>
        </div>
    );
}

export default FunnelChart;