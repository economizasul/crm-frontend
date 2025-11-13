// src/components/reports/SummaryKpis.jsx
import React from 'react';
import { FaTachometerAlt } from 'react-icons/fa';

export default function SummaryKpis({ summaryData }) {
    
    // 🟢 CORREÇÃO: Simplesmente retorna null se não houver dados.
    if (!summaryData) return null; 

    // Este componente é um placeholder, pois os KPIs principais já estão no ReportsDashboard.jsx.
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <FaTachometerAlt className="mr-2 text-indigo-500" />
                Resumo dos Principais KPIs
            </h3>
            <p className="mt-2 text-sm text-gray-500">
                Os cartões KPI estão sendo renderizados diretamente no componente ReportsDashboard.jsx.
            </p>
        </div>
    );
}