// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaPercentage, FaTags, FaClock, FaSpinner } from 'react-icons/fa';

import ProductivityTable from './ProductivityTable.jsx';
import FunnelChart from './FunnelChart.jsx'; 
import LostReasonsTable from './LostReasonsTable.jsx';
// Assumindo que DailyActivity.jsx existe
import DailyActivity from './DailyActivity.jsx'; 

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

export default function ReportsDashboard({ data, loading, error }) {
    
    // 🚨 CORREÇÃO CRÍTICA: Trata o estado de carregamento e ausência de dados imediatamente
    if (loading) {
        return (
            <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm text-center flex justify-center items-center h-48">
                <FaSpinner className="animate-spin mr-3 text-indigo-600 w-5 h-5" />
                Carregando dados do relatório...
            </div>
        );
    }

    // Se não está carregando e não tem dados nem erro, mostra a mensagem padrão
    if (!data && !error) {
         return (
            <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm text-center">
                📊 Use os filtros e clique em <strong>Aplicar Filtros</strong> para carregar o relatório.
            </div>
        );
    }
    
    // Se há erro, o ReportsPage já deveria ter tratado, mas garantimos
    if (error) return null; 

    // Destrutura os dados para facilitar o acesso
    const productivity = data.productivity || {};
    
    // Funções de formatação (reforçadas para evitar quebras)
    const formatNumber = (value) => (value ?? 0).toLocaleString('pt-BR');
    const formatPercent = (value) => `${((value ?? 0) * 100).toFixed(2).replace('.', ',')}%`;
    const formatKw = (value) => `${(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KW`;
    
    // Mapeamento dos KPIs principais
    const kpis = [
        { 
            title: "Total de Leads", 
            value: formatNumber(productivity.totalLeads), 
            icon: FaTags, 
            colorClass: 'text-indigo-600', 
            subtext: 'Leads criados no período' 
        },
        { 
            title: "KW Vendido (Total)", 
            value: formatKw(productivity.totalWonValueKW), 
            icon: FaDollarSign, 
            colorClass: 'text-green-600',
            subtext: `R$ Estimado: R$ ${formatNumber(productivity.totalWonValueSavings)}`
        },
        { 
            title: "Taxa de Conversão", 
            value: formatPercent(productivity.conversionRate), 
            icon: FaChartLine, 
            colorClass: 'text-blue-600', 
            subtext: 'Leads Fechado Ganho / Total Leads' 
        },
        { 
            title: "Tempo Médio de Fechamento", 
            value: `${(productivity.avgClosingTimeDays ?? 0).toFixed(1).replace('.', ',')} dias`, 
            icon: FaClock, 
            colorClass: 'text-orange-600',
            subtext: 'Média para Leads Fechado Ganho'
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* 1. KPIS PRINCIPAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map((kpi) => (
                    <DashboardCard key={kpi.title} {...kpi} />
                ))}
            </div>

            {/* 2. PRODUTIVIDADE E FUNIL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    {/* Tabela de Produtividade */}
                    <ProductivityTable metrics={productivity} />
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100"
                >
                    {/* Gráfico de Funil */}
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Funil de Vendas</h3>
                    <FunnelChart funnelStages={data.funnel} />
                </motion.div>
            </div>
            
            {/* 3. ANÁLISE DE CHURN E ATIVIDADE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <LostReasonsTable lostLeadsAnalysis={data.lostReasons} />
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {/* Exibe o componente de Atividade Diária (assumindo que existe) */}
                    <DailyActivity dailyActivityData={data.dailyActivity} />
                </motion.div>
            </div>

        </motion.div>
    );
}