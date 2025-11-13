// src/components/reports/ReportsDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaPercentage, FaTags, FaClock, FaSpinner } from 'react-icons/fa';

// Componentes importados (Todos devem estar presentes na pasta reports/)
import SummaryKpis from './SummaryKpis.jsx'; 
import ProductivityTable from './ProductivityTable.jsx';
import FunnelChart from './FunnelChart.jsx'; 
import LostReasonsTable from './LostReasonsTable.jsx';
import DailyActivity from './DailyActivity.jsx'; // ⚠️ Adicionado para resolver a dependência

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
        {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
    </motion.div>
);

// Função auxiliar para formatação segura de kW
const formatKw = (value) => {
    // 🟢 CORREÇÃO: Garante que o valor é um número (0 se nulo) antes de formatar
    const num = Number(value ?? 0);
    return `${num.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kW`;
};

// Função auxiliar para formatação segura de porcentagem (Backend retorna 0-100)
const formatPercent = (value) => {
    // 🟢 CORREÇÃO: Garante que o valor é um número (0 se nulo) antes de formatar
    const num = Number(value ?? 0);
    return `${num.toFixed(1).replace('.', ',')}%`; 
};

// Função auxiliar para formatação segura de dias
const formatDays = (value) => {
    const num = Number(value ?? 0);
    return `${num.toFixed(1).replace('.', ',')} dias`;
};


export default function ReportsDashboard({ data, loading, error }) {
    
    if (loading) {
        return (
            <div className="flex justify-center items-center p-12 bg-white rounded-2xl shadow-md border border-gray-100 min-h-[400px]">
                <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="ml-3 text-lg text-gray-600">Carregando dados...</span>
            </div>
        );
    }
    
    if (!data || error) {
        return null; // Deixa o ReportsPage exibir a mensagem de erro/instrução
    }

    // 🟢 Acesso seguro com optional chaining
    const summary = data?.summary;
    const productivity = data?.productivity;
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            
            {/* 1. KPIs de Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Leads Totais" 
                    // 🟢 Acesso seguro e formatação
                    value={(summary?.totalLeads ?? 0).toLocaleString('pt-BR')}
                    icon={FaTags}
                />
                <DashboardCard 
                    title="KW Vendido" 
                    // 🟢 Acesso seguro e formatação
                    value={formatKw(summary?.totalKwWon)}
                    icon={FaDollarSign}
                    colorClass="text-green-600"
                />
                <DashboardCard 
                    title="Taxa de Conversão" 
                    // 🟢 Acesso seguro e formatação
                    value={formatPercent(summary?.conversionRate)}
                    icon={FaPercentage}
                    colorClass="text-teal-600"
                />
                <DashboardCard 
                    title="Tempo Médio Fechamento" 
                    // 🟢 Acesso seguro e formatação
                    value={formatDays(summary?.avgTimeToWinDays)}
                    icon={FaClock}
                    colorClass="text-orange-600"
                />
            </div>

            {/* 2. TABELA DE PRODUTIVIDADE E FUNIL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    {/* Tabela de Produtividade */}
                    <ProductivityTable 
                        // 🟢 Passa os dados de forma segura
                        metrics={productivity}
                    />
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1"
                >
                    {/* Gráfico de Funil */}
                    <FunnelChart 
                        // 🟢 Passa os dados de forma segura
                        funnelStages={data?.funnel} 
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
                    <LostReasonsTable 
                        // 🟢 Passa os dados de forma segura
                        lostReasonsData={data?.lostReasons} 
                    />
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {/* Componente DailyActivity */}
                    <DailyActivity 
                        // 🟢 Passa os dados de forma segura
                        dailyActivityData={data?.dailyActivity}
                    />
                </motion.div>
            </div>
            {/* O SummaryKpis não é mais necessário, pois os KPIs foram movidos para o Dashboard */}
        </motion.div>
    );
}