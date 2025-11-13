// src/components/reports/ReportsDashboard.jsx (COMPLETO E CORRIGIDO)
import React from 'react';
import { motion } from 'framer-motion';
// Ajuste os ícones para refletir as 4 métricas principais filtradas
import { FaDollarSign, FaChartLine, FaTags, FaClock, FaSpinner } from 'react-icons/fa';

// Componentes assumidos (verifique se os paths estão corretos)
import ProductivityTable from './ProductivityTable.jsx';
import FunnelChart from './FunnelChart.jsx'; 
import LostReasonsTable from './LostReasonsTable.jsx';
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
    
    // 🚨 Trata o estado de carregamento e ausência de dados
    if (loading) {
        return (
            <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm text-center flex justify-center items-center h-48">
                <FaSpinner className="animate-spin mr-3 text-indigo-600 w-5 h-5" />
                Carregando dados do relatório...
            </div>
        );
    }
    
    if (!data || error) {
         return null; 
    }
    
    // Usamos 'productivity' para os KPIs DO DASHBOARD PRINCIPAL (que respeitam os filtros)
    const productivity = data.productivity || {};
    
    // Funções de formatação (reforçadas)
    const formatNumber = (value) => Number(value ?? 0).toLocaleString('pt-BR');
    const formatPercent = (value) => `${(Number(value ?? 0) * 100).toFixed(2).replace('.', ',')}%`;
    const formatKw = (value) => `${Number(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW`;
    
    // Mapeamento dos KPIs principais (usando dados FILTRADOS de productivity)
    const kpis = [
        { 
            title: "Leads Ativos", 
            value: formatNumber(productivity.leadsActive), // Leads Ativos (Status != Ganho/Perdido)
            icon: FaTags, 
            colorClass: 'text-indigo-600', 
            subtext: 'Leads no funil (sem Ganho/Perdido) no período' 
        },
        { 
            title: "KW Vendido (Período)", 
            value: formatKw(productivity.totalWonValueKW), 
            icon: FaDollarSign, 
            colorClass: 'text-green-600',
            subtext: `Vendas Concluídas (Qtd): ${formatNumber(productivity.totalWonCount)}`
        },
        { 
            title: "Taxa de Conversão", 
            value: formatPercent(productivity.conversionRate), 
            icon: FaChartLine, 
            colorClass: 'text-blue-600', 
            subtext: `Taxa de Perda: ${formatPercent(productivity.lossRate)}` 
        },
        { 
            title: "Tempo Médio de Fechamento", 
            value: `${Number(productivity.avgClosingTimeDays ?? 0).toFixed(1).replace('.', ',')} dias`, 
            icon: FaClock, 
            colorClass: 'text-orange-600',
            subtext: 'Média para Leads Fechado Ganho no período'
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* 1. KPIS PRINCIPAIS (Métricas Filtradas) */}
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
                    {/* Tabela de Produtividade: Métrica de Produtividade (filtrada) */}
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
                    <DailyActivity dailyActivityData={data.dailyActivity} />
                </motion.div>
            </div>

        </motion.div>
    );
}