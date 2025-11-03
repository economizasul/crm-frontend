// src/components/reports/ReportsDashboard.jsx

import React from 'react';
import FunnelChart from './FunnelChart';
import ProductivityTable from './ProductivityTable'; // Componente a ser criado
import ForecastCard from './ForecastCard'; // Componente a ser criado
import LostReasonsTable from './LostReasonsTable'; // Componente a ser criado
import AnalyticNotes from './AnalyticNotes'; // Componente a ser criado

/**
 * Componente que exibe os dados consolidados do dashboard.
 * @param {Object} data - Dados retornados pelo useReports.
 */
function ReportsDashboard({ data }) {
    
    if (!data) return <p className="text-gray-500">Nenhum dado de relatório para exibir.</p>;

    return (
        <div className="grid grid-cols-12 gap-6">
            
            {/* 1. RELATÓRIO DE PRODUTIVIDADE DO VENDEDOR (Tabela) */}
            <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Relatório de Produtividade do Vendedor</h2>
                <ProductivityTable metrics={data.productivity} />
            </div>

            {/* 2. FORECASTING (Card de Valor Ponderado) */}
            <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Relatório de Previsão de Vendas (Forecasting)</h2>
                <ForecastCard forecast={data.salesForecast} />
            </div>

            {/* 3. ANÁLISE DE FUNIL POR ORIGEM DE LEAD (Gráfico) */}
            <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Análise de Funil por Origem de Lead</h2>
                <FunnelChart funnelData={data.funnelBySource} />
            </div>
            
            {/* 4. RELATÓRIO DE PERDAS (Análise de Churn) */}
            <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold mb-4 text-gray-700">Relatório de Perdas (Análise de Churn)</h2>
                 <LostReasonsTable reasons={data.lostReasons} />
            </div>
            
            {/* 5. RELATÓRIO ANALÍTICO DE ATENDIMENTO (Ocupa a largura total na parte inferior) */}
            <div className="col-span-12 bg-white p-5 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Relatório Analítico de Atendimento</h2>
                <AnalyticNotes />
            </div>
        </div>
    );
}

export default ReportsDashboard;

// Nota: Os componentes específicos (ProductivityTable, FunnelChart, etc.) devem ser criados separadamente.