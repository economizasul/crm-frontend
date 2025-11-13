// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaPercentage, FaTags, FaClock, FaSpinner } from 'react-icons/fa';

// Componentes do Dashboard
import ProductivityTable from './ProductivityTable.jsx';
import FunnelChart from './FunnelChart.jsx'; 
import LostReasonsTable from './LostReasonsTable.jsx';
import DailyActivity from './DailyActivity.jsx'; 
import SummaryKpis from './SummaryKpis.jsx'; // Mantido como placeholder

/**
 * Cartão de KPI Reutilizável
 */
const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', subtext = '' }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100"
    >
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
        {subtext && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
    </motion.div>
);

/**
 * Componente principal que renderiza o dashboard inteiro.
 */
export default function ReportsDashboard({ data, loading, error }) {

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <FaSpinner className="animate-spin text-5xl text-indigo-600" />
                <p className="ml-4 text-gray-600 text-lg">A carregar dados do relatório...</p>
            </div>
        );
    }
    
    if (!data) return null;

    // Desestrutura os dados para uso simplificado
    const { productivity, funnel, lostReasons } = data;
    
    // Funções de formatação
    const formatPercent = (value) => `${(value * 100).toFixed(1).replace('.', ',')}%`;
    const formatKwValue = (value) => `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KW`;
    const formatDays = (value) => `${Number(value).toFixed(1).replace('.', ',')} dias`;

    return (
        <div className="space-y-6">
            
            {/* 1. LINHA DE KPIS DE RESUMO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Leads Ativos" 
                    value={productivity.leadsActive.toLocaleString('pt-BR')} 
                    icon={FaTags}
                    colorClass="text-indigo-600"
                    subtext="Status != Ganho/Perdido"
                />
                <DashboardCard 
                    title="Vendas Concluídas (KW)" 
                    value={formatKwValue(productivity.totalWonValueKW)}
                    icon={FaDollarSign}
                    colorClass="text-green-600"
                    subtext={`${productivity.totalWonCount} negócios fechados`}
                />
                <DashboardCard 
                    title="Taxa de Conversão" 
                    value={formatPercent(productivity.conversionRate)}
                    icon={FaPercentage}
                    colorClass="text-teal-600"
                    subtext="Total Ganho / Total Criado"
                />
                <DashboardCard 
                    title="Tempo Médio de Fechamento" 
                    value={formatDays(productivity.avgClosingTimeDays)}
                    icon={FaClock}
                    colorClass="text-yellow-600"
                    subtext="Do início ao Ganho"
                />
            </div>

            {/* 2. TABELA DE PRODUTIVIDADE E FUNIL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabela de Produtividade (ocupa 2 colunas) */}
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <ProductivityTable metrics={productivity} />
                </motion.div>
                
                {/* Gráfico de Funil (ocupa 1 coluna) */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100"
                >
                    <FunnelChart funnelStages={funnel} />
                </motion.div>
            </div>
            
            {/* 3. ANÁLISE DE CHURN E ATIVIDADE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabela de Motivos de Perda (ocupa 1 coluna) */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* 🟢 CORRIGIDO: Propriedade ajustada para lostLeadsAnalysis */}
                    <LostReasonsTable lostLeadsAnalysis={lostReasons} />
                </motion.div>
                
                {/* Gráfico de Atividade Diária (usando o componente que você confirmou) */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {/* Nota: dailyActivityData virá null até ser implementado no backend */}
                    <DailyActivity dailyActivityData={data.dailyActivity} />
                </motion.div>
            </div>
            
        </div>
    );
}