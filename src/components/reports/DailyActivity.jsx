// src/components/reports/DailyActivity.jsx
import React from 'react';
import { FaCalendarDay } from 'react-icons/fa';

export default function DailyActivity({ dailyActivityData }) {
    if (!dailyActivityData || dailyActivityData.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <FaCalendarDay className="mr-2 text-blue-500" />
                    Atividade Diária
                </h3>
                <p className="text-gray-500">Nenhuma atividade registrada no período.</p>
            </div>
        );
    }

    // Nota: O código de renderização do gráfico/tabela deve ser implementado aqui. 
    // Por enquanto, apenas exibe a estrutura básica.

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaCalendarDay className="mr-2 text-blue-500" />
                Atividade Diária (Engajamento)
            </h3>
            <p className="text-gray-600">
                Gráfico de atividades (criação de leads, notas, vendas) por dia.
            </p>
            {/* Aqui você pode renderizar um gráfico de barras ou de linha com base em dailyActivityData */}
        </div>
    );
}