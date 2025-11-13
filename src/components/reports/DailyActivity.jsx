// src/components/reports/DailyActivity.jsx

import React from 'react';
import { FaChartBar } from 'react-icons/fa';

/**
 * Placeholder para o Gráfico de Atividade Diária (Leads Criados).
 * @param {Array} dailyActivityData - Array de objetos { date, leadsCreated }.
 */
function DailyActivity({ dailyActivityData }) {
    
    // 🟢 Proteção contra null/undefined
    const activityData = dailyActivityData || [];
    const totalDays = activityData.length;
    // Soma os leads de forma segura
    const totalLeads = activityData.reduce((sum, item) => sum + (item.leadsCreated || 0), 0);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <FaChartBar className="mr-2 text-blue-500" />
                Atividade Diária (Leads Criados)
            </h3>
            
            {totalDays === 0 ? (
                <div className="text-gray-500 p-8 text-center">
                    Nenhuma atividade de criação de leads no período.
                </div>
            ) : (
                <div className="text-sm text-gray-600">
                    <p>Média de {totalDays > 0 ? (totalLeads / totalDays).toFixed(1).replace('.', ',') : '0'} leads/dia no período.</p>
                    <p className="mt-2 text-gray-500 text-xs">
                        * Este é um placeholder. Aqui deve ser renderizado um gráfico de barras ou linhas usando o 
                        array de {totalDays} dias.
                    </p>
                </div>
            )}
        </div>
    );
}

export default DailyActivity;