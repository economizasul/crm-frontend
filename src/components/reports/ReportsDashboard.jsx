// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaPercentage, FaTags, FaClock, FaSpinner } from 'react-icons/fa';

// 🚨 ATENÇÃO: Estes componentes DEVEM existir (e agora o DailyActivity.jsx existe!)
import ProductivityTable from './ProductivityTable.jsx';
import FunnelChart from './FunnelChart.jsx'; 
import LostReasonsTable from './LostReasonsTable.jsx';
// Importe DailyActivity se você o tiver, ou mantenha o comentário
// import DailyActivity from './DailyActivity.jsx'; 

// Componente Card de KPI (ajustado com arredondamento '2xl')
const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', subtext = '' }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
        // ESTILIZAÇÃO PADRÃO: p-5, rounded-2xl, shadow-md, border
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


const ReportsDashboard = ({ data, loading, error }) => {

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white p-6 rounded-2xl shadow-md">
                <FaSpinner className="animate-spin w-8 h-8 text-indigo-500 mr-2" />
                <span className="text-lg text-gray-700">Carregando métricas...</span>
            </div>
        );
    }
    
    if (!data || error) {
        return null; // O ReportsPage lida com a mensagem de erro/vazio
    }
    
    // Dados de Produtividade (Simplificados para evitar quebras)
    const prod = data.productivity || {};

    return (
        // Espaçamento vertical entre as linhas de componentes
        <div className="space-y-6"> 
            
            {/* 1. KPIs de Resumo */}
            {/* Grid com 2 colunas em telas pequenas, e 4 colunas em telas grandes, para melhor distribuição dos cartões */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <DashboardCard title="Total Leads" value={(prod.totalLeads ?? 0).toLocaleString('pt-BR')} icon={FaTags} colorClass="text-indigo-600" />
                <DashboardCard title="Fechados (Qtd)" value={(prod.totalWonCount ?? 0).toLocaleString('pt-BR')} icon={FaChartLine} colorClass="text-green-600" />
                <DashboardCard title="Valor Fechado (KW)" value={`${Number(prod.totalWonValueKW ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW`} icon={FaDollarSign} colorClass="text-green-600" />
                <DashboardCard title="Conversão" value={(prod.conversionRate * 100).toFixed(1).replace('.', ',') + '%'} icon={FaPercentage} colorClass="text-blue-600" />
                <DashboardCard title="Perda (Taxa)" value={(prod.lossRate * 100).toFixed(1).replace('.', ',') + '%'} icon={FaPercentage} colorClass="text-red-500" />
                <DashboardCard title="Tempo Médio (dias)" value={(prod.avgClosingTimeDays ?? 0).toFixed(1).replace('.', ',')} icon={FaClock} colorClass="text-yellow-600" />
            </div>

            {/* 2. PRODUTIVIDADE E FUNIL */}
            {/* Grid com 3 colunas em telas grandes (2/3 + 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    // Ocupa 2 de 3 colunas em telas grandes
                    className="lg:col-span-2" 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProductivityTable metrics={prod} />
                </motion.div>
                
                <motion.div 
                    // Ocupa 1 de 3 colunas em telas grandes
                    className="lg:col-span-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* O componente FunnelChart já deve ter o background/shadow interno */}
                    <FunnelChart funnelStages={data.funnel} />
                </motion.div>
            </div>
            
            {/* 3. ANÁLISE DE CHURN E ATIVIDADE */}
            {/* Grid com 2 colunas em telas grandes (1/2 + 1/2) */}
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
                    {/* Se você tiver o DailyActivity, descomente e use aqui. Caso contrário, substitua por outro componente. */}
                    {/* <DailyActivity dailyActivityData={data.dailyActivity} /> */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-64 flex items-center justify-center">
                        <p className="text-gray-500">Gráfico de Atividade Diária (DailyActivity.jsx)</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReportsDashboard;