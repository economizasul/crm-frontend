// src/components/reports/SummaryKpis.jsx
import React from 'react';
import { FaTachometerAlt } from 'react-icons/fa';

export default function SummaryKpis({ summaryData }) {
    if (!summaryData) return null; // Componente desnecessário, pois ReportsDashboard já trata os KPIs

    // Este componente não é estritamente necessário se ReportsDashboard já mostra os KPIs.
    // Usamos ele apenas como um placeholder.
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <FaTachometerAlt className="mr-2 text-indigo-500" />
                Resumo dos Principais KPIs
            </h3>
            <p className="mt-2 text-sm text-gray-500">
                Os cartões KPI (Total de Leads, Vendas, Conversão, etc.) estão sendo renderizados diretamente no ReportsDashboard.
            </p>
        </div>
    );
}