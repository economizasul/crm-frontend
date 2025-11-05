// src/components/reports/ReportsDashboard.jsx

import React from 'react';
// ⭐️ CORREÇÃO AQUI: Se estiver na mesma pasta 'reports', o caminho deve ser relativo
import ProductivityTable from './ProductivityTable'; 
import KPICard from './KPICard'; 
import ConversionChart from './ConversionChart'; 
// (Assumindo que KPICard e ConversionChart também estão em src/components/reports/)

/**
 * Componente Dashboard de Relatórios.
 * Responsável por organizar e exibir todas as métricas em diferentes componentes.
 * * @param {Object} props
 * @param {Object} props.metrics - O objeto de métricas completo retornado pelo useReports.
 */
function ReportsDashboard({ metrics }) {
    
    if (!metrics) {
        return (
             <div className="mt-8 p-4 text-center text-gray-500">
                Aguardando dados ou nenhum dado encontrado para os filtros.
            </div>
        );
    }
    
    const { 
        productivity, 
        conversionBySource, 
        summaryKPIs 
    } = metrics;

    return (
        <div className="space-y-8 mt-6">
            
            {/* 1. Área de KPIs de Resumo (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Total de Leads Ativos" 
                    value={productivity?.leadsActive?.toLocaleString('pt-BR') || '0'} 
                    description="Leads que não são 'Ganho' ou 'Perdido'."
                />
                 <KPICard 
                    title="Valor Total de Vendas" 
                    value={`R$ ${productivity?.totalWonValue?.toFixed(2).replace('.', ',') || '0,00'}`} 
                    description="Soma do valor de negócios concluídos (Ganho)."
                />
                 <KPICard 
                    title="Taxa de Conversão" 
                    value={`${(productivity?.conversionRate * 100)?.toFixed(2).replace('.', ',') || '0,00'}%`} 
                    description="Leads Ganho / (Ganho + Perdido + Ativo)."
                />
                
            </div>

            {/* 2. Tabela de Produtividade (Detalhes) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Produtividade Agregada</h2>
                <ProductivityTable metrics={productivity} /> 
            </div>

            {/* 3. Gráfico de Conversão (Por Exemplo: Por Fonte) */}
            {conversionBySource && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversão por Fonte de Lead</h2>
                    <div className="text-gray-500 p-4">Espaço reservado para Gráfico de Conversão.</div>
                </div>
            )}
        </div>
    );
}

export default ReportsDashboard;