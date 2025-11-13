// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaPercentage, FaTags, FaSpinner } from 'react-icons/fa';

// 🚨 ATENÇÃO: Você DEVE criar estes arquivos na pasta src/components/reports/
import SummaryKpis from './SummaryKpis.jsx'; 
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

export default function ReportsDashboard({ data, loading, error, fetchAnalyticNotes }) {
    
    // --- Lógica de Estado ---
    if (loading) {
        return (
            <div className="mt-8 p-6 text-center text-gray-500">
                <FaSpinner className="animate-spin w-8 h-8 mx-auto mb-2" />
                Carregando métricas do relatório...
            </div>
        );
    }
    
    // O erro será exibido pelo ReportsPage.jsx (componente pai), mas tratamos aqui também.
    if (error || !data || !data.summary) {
        // Retorna um placeholder amigável se o carregamento falhou ou os dados estão vazios
        return (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm text-center">
                ❌ **Erro ao carregar dados.** O Backend pode estar indisponível ou os filtros não retornaram dados.
                <br />
                *Verifique os logs de erro 500 no seu Render para o endpoint `/reports/data`.*
            </div>
        );
    }
    
    // --- Formatação de Helpers ---
    const formatKw = (kw) => Number(kw).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' kW';
    const formatPct = (pct) => Number(pct).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
    const formatDays = (days) => Number(days).toFixed(1).replace('.', ',') + ' dias';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {/* 1. SEÇÃO DE KPIS PRINCIPAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Total de Leads"
                    value={data.summary.totalLeads.toLocaleString('pt-BR')}
                    icon={FaTags}
                    colorClass="text-blue-500"
                    subtext={`${data.summary.activeLeads.toLocaleString('pt-BR')} Leads Ativos`}
                />
                <DashboardCard 
                    title="Vendas (kW)"
                    value={formatKw(data.summary.totalKwWon)}
                    icon={FaDollarSign}
                    colorClass="text-green-600"
                    subtext={`${data.summary.wonLeadsQty} Vendas Concluídas`}
                />
                <DashboardCard 
                    title="Taxa de Conversão"
                    value={formatPct(data.summary.conversionRate)}
                    icon={FaPercentage}
                    colorClass="text-yellow-500"
                    subtext={`Taxa de Perda: ${formatPct(data.summary.churnRate)}`}
                />
                <DashboardCard 
                    title="T. Médio Fechamento"
                    value={formatDays(data.summary.avgTimeToWinDays)}
                    icon={FaClock}
                    colorClass="text-purple-500"
                    subtext={`Previsão: ${formatKw(data.forecasting.forecastedKwWeighted)}`}
                />
            </div>
            
            {/* 2. PRODUTIVIDADE E FUNIL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-gray-100"
                >
                    {/* Tabela de Produtividade: Usa fetchAnalyticNotes ao clicar em um vendedor */}
                    <ProductivityTable 
                        productivityData={data.productivity} 
                        // Exemplo: onVendorClick={(vendorId) => fetchAnalyticNotes({ leadId: null, stage: null, vendorId })}
                    /> 
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100"
                >
                    {/* Gráfico de Funil: Usa fetchAnalyticNotes ao clicar em uma fase */}
                    <FunnelChart 
                        funnelData={data.funnel} 
                        // Exemplo: onStageClick={(stage) => fetchAnalyticNotes({ stage })}
                    />
                </motion.div>
            </div>
            
            {/* 3. ANÁLISE DE CHURN E ATIVIDADE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <LostReasonsTable lostReasonsData={data.lostReasons} />
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