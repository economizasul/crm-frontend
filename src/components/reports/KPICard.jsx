// src/components/reports/KPICard.jsx

import React from 'react';
import { FaChartLine } from 'react-icons/fa'; 

/**
 * Componente Card de KPI (Key Performance Indicator).
 * Exibe uma métrica importante em destaque.
 * * @param {Object} props
 * @param {string} props.title - Título da métrica (ex: "Leads Ativos").
 * @param {string} props.value - Valor formatado da métrica (ex: "1.250").
 * @param {string} props.description - Breve descrição ou contexto.
 * @param {React.Component} [props.Icon=FaChartLine] - Icone opcional (default FaChartLine).
 */
function KPICard({ title, value, description, Icon = FaChartLine }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                {/* O ícone não é usado no ReportsDashboard, mas fica aqui para reutilização */}
                {/* <Icon className="h-5 w-5 text-indigo-400" /> */}
            </div>
            <div className="mt-1">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="mt-2 text-xs text-gray-400">
                {description}
            </div>
        </div>
    );
}

export default KPICard;