// src/components/reports/ReportsDashboard.jsx (COMPLETO E CORRIGIDO)
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaTags, FaClock } from 'react-icons/fa';

// Componentes assumidos (verifique se os paths estão corretos)
import ProductivityTable from './ProductivityTable.jsx';
// import FunnelChart from './FunnelChart.jsx'; // 🚨 REMOVIDO E SUBSTITUÍDO
import LostReasonsTable from './LostReasonsTable.jsx';
import DailyActivity from './DailyActivity.jsx'; 
import ParanaMap from './ParanaMap.jsx'; // 🚨 NOVO

// O componente DashboardCard foi movido para fora do export default para uso interno.
const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', subtext = '' }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
        // Estilo Ultra Moderno: Borda leve, cantos arredondados, sombra sutil
        className="bg-white p-5 rounded-2xl shadow-xl border border-gray-50/50" 
    >
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{subtext}</p>
    </motion.div>
);

export default function ReportsDashboard({ data, loading, error }) {
    if (!data && !loading) return null;
    
    const { productivity, lostReasons, dailyActivity, mapLocations } = data || {}; 

    // Layout Ultra Moderno: Foco na clareza e no mapa.
    return (
        <div className="space-y-6">
            
            {/* 1. KPIs de Destaque */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* Total de Leads (adaptado para a nova métrica 'totalLeads') */}
                <DashboardCard 
                    title="Leads Totais" 
                    value={Number(productivity?.totalLeads ?? 0).toLocaleString('pt-BR')} 
                    icon={FaTags} 
                    colorClass="text-indigo-600"
                    subtext="No período filtrado"
                />
                {/* KW Vendido */}
                <DashboardCard 
                    title="KW Vendido" 
                    value={`${Number(productivity?.totalWonValueKW ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kW`} 
                    icon={FaDollarSign} 
                    colorClass="text-green-600"
                    subtext="Valor Fechado"
                />
                {/* Taxa Conversão */}
                <DashboardCard 
                    title="Taxa Conversão" 
                    value={`${(productivity?.conversionRate * 100 ?? 0).toFixed(1).replace('.', ',')}%`} 
                    icon={FaChartLine} 
                    colorClass="text-blue-600"
                    subtext="Ganho/Total"
                />
                {/* Fechamento Médio */}
                <DashboardCard 
                    title="Fechamento Médio" 
                    value={`${Number(productivity?.avgClosingTimeDays ?? 0).toFixed(1).replace('.', ',')} dias`} 
                    icon={FaClock} 
                    colorClass="text-orange-600"
                    subtext="Tempo até o Ganho"
                />
            </div>

            {/* 2. MAPA E PRODUTIVIDADE (Grid 1/3 para a tabela, 2/3 para o mapa) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA 1: Tabela de Produtividade (1/3 da largura no desktop) */}
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-1"
                >
                    <ProductivityTable metrics={productivity} />
                </motion.div>
                
                {/* COLUNA 2/3: MAPA DO PARANÁ (2/3 da largura no desktop - Destaque Principal) */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 min-h-[500px]"
                >
                    <ParanaMap 
                        mapLocations={mapLocations} 
                        loading={loading}
                        // Usando a imagem de referência do mapa que o usuário anexou (image_a54727.jpg)
                        mapImageRef="/images/parana_map_reference.jpg" 
                    />
                </motion.div>
            </div>
            
            {/* 3. ANÁLISE DETALHADA (Linha Inferior) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* Atividade Diária (Gráfico/Tabela) */}
                    <DailyActivity dailyActivityData={dailyActivity} />
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* Motivos de Perda (LostReasonsTable) */}
                    <LostReasonsTable lostLeadsAnalysis={lostReasons} />
                </motion.div>
            </div>

        </div>
    );
}