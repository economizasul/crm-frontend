// src/components/reports/FunnelChart.jsx

import React from 'react';

/**
 * Componente que exibe a distribuição de leads pelo Funil de Vendas.
 * Atualmente um placeholder para futura integração com biblioteca de gráficos.
 * @param {Array} funnelStages - Array de objetos representando as fases do funil.
 */
function FunnelChart({ funnelStages }) {
    
    if (!funnelStages || funnelStages.length === 0) {
        return (
            // ESTILIZAÇÃO PADRÃO: p-6, rounded-2xl, shadow-md, border
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-96 flex flex-col justify-center items-center">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Funil de Vendas</h3>
                <p className="text-gray-500">Nenhum dado de funil encontrado.</p>
            </div>
        );
    }
    
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
        // ESTILIZAÇÃO PADRÃO: p-6, rounded-2xl, shadow-md, border
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Funil de Vendas</h3>
            <div className="space-y-5">
                {funnelStages.map((stage, index) => {
                    // Calcula a porcentagem em relação ao total de leads
                    const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;
                    const color = stageColors[stage.stageName] || 'bg-gray-400';
                    
                    return (
                        <div key={stage.stageName} className="relative">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                    {stage.stageName}
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    {stage.count.toLocaleString('pt-BR')} ({percentage.toFixed(1).replace('.', ',')}% )
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
                * Este é um modelo de visualização que pode ser substituído por um gráfico real (ex: Funnel Chart do Recharts) futuramente.
            </p>
        </div>
    );
}

export default FunnelChart;