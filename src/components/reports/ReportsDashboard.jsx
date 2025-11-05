// src/components/reports/ReportsDashboard.jsx

import React from 'react';
// Importa os componentes filhos que acabamos de criar/corrigir
import KPICard from './KPICard';
import ProductivityTable from './ProductivityTable';
import ConversionChart from './ConversionChart'; 
import { FaChartLine, FaDollarSign, FaHandshake, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';


/**
 * Componente principal do Dashboard de Relatórios.
 * Recebe todos os dados e funções de estado do hook useReports.
 * * @param {Object} props
 * @param {Object} props.data - O objeto completo de métricas retornado pelo Backend.
 * @param {boolean} props.loading - Indica se os dados estão sendo carregados.
 * @param {string} props.error - Mensagem de erro.
 */
function ReportsDashboard({ data, loading, error }) {
    
    // Fallback/Verificação de estado
    if (loading && !data) {
        return <div className="text-center p-8 text-xl text-indigo-600">Carregando métricas do Dashboard...</div>;
    }
    
    if (error) {
        return <div className="text-center p-8 text-xl text-red-600 border border-red-300 bg-red-50 rounded-lg">Erro ao carregar dados: {error}</div>;
    }

    if (!data) {
        return <div className="text-center p-8 text-xl text-gray-500 border border-gray-300 bg-gray-50 rounded-lg">Aplique filtros para carregar o relatório.</div>;
    }

    // Desestrutura os dados para facilitar o uso (conforme a estrutura do ReportDataService)
    const { productivity, conversionBySource } = data;

    // Função auxiliar para formatar porcentagens (deve ser a mesma do ProductivityTable)
    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        return `${(value * 100).toFixed(1).replace('.', ',')}%`;
    };

    // Função auxiliar para formatar valores monetários (deve ser a mesma do ProductivityTable)
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    // Mapeamento dos principais KPIs para o layout em cartão
    const kpiMetrics = [
        {
            title: "Valor Total de Vendas",
            value: formatCurrency(productivity.totalWonValue),
            description: "Valor total de leads convertidos no período.",
            Icon: FaDollarSign,
        },
        {
            title: "Taxa de Conversão",
            value: formatPercent(productivity.conversionRate),
            description: "Leads convertidos / Leads Ativos.",
            Icon: FaHandshake,
        },
        {
            title: "Leads Ativos (Não Fechados)",
            value: productivity.leadsActive.toLocaleString('pt-BR'),
            description: "Total de leads em negociação.",
            Icon: FaChartLine,
        },
        {
            title: "Tempo Médio de Fechamento",
            value: `${productivity.avgClosingTimeDays.toFixed(1)} dias`,
            description: "Média de dias desde o cadastro até o 'Fechado/Ganho'.",
            Icon: FaHourglassHalf,
        },
    ];

    return (
        <div className="space-y-8">
            {/* 1. MÉTICAS DE KPI (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiMetrics.map((metric, index) => (
                    <KPICard 
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        description={metric.description}
                        Icon={metric.Icon}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 2. TABELA DE PRODUTIVIDADE */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Resumo de Produtividade</h2>
                    <ProductivityTable metrics={productivity} />
                </div>

                {/* 3. GRÁFICO DE CONVERSÃO POR FONTE */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Conversão por Fonte</h2>
                    {/* Passa os dados de conversão para o componente de gráfico (mesmo que seja placeholder) */}
                    <ConversionChart data={conversionBySource} /> 
                </div>

            </div>

        </div>
    );
}

export default ReportsDashboard;