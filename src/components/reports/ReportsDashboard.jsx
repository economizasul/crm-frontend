import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaDollarSign, FaChartLine, FaTags, FaClock } from "react-icons/fa";

import ProductivityTable from "./ProductivityTable.jsx";
import LostReasonsTable from "./LostReasonsTable.jsx";
import DailyActivity from "./DailyActivity.jsx";
import ParanaMap from "./ParanaMap.jsx"; // NOVO MAPA INTERATIVO
import { buscarLeadsGanhoParaMapa } from "../../services/ReportService";

const DashboardCard = ({ title, value, icon: Icon, colorClass = "text-indigo-600", subtext = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
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

export default function ReportsDashboard({ data = {}, loading = false, error = null }) {
  const navigate = useNavigate();
  const [leadsMapa, setLeadsMapa] = useState([]);

  const productivity = data?.productivity || {};
  const lostReasons = data?.lostReasons || {};
  const dailyActivity = data?.dailyActivity || {};

  // Carrega os leads para o mapa sempre que os filtros mudarem
  useEffect(() => {
    if (!data?.filters) return;

    const carregarMapa = async () => {
      const filtros = {
        startDate: data.filters.startDate,
        endDate: data.filters.endDate,
        vendedor: data.filters.vendedor
      };

      const leads = await buscarLeadsGanhoParaMapa(filtros);
      setLeadsMapa(leads);
    };

    carregarMapa();
  }, [data?.filters]);

  const fmtNumber = (v) => Number(v ?? 0).toLocaleString("pt-BR");
  const fmtKw = (v) => `${Number(v ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kW`;
  const fmtPercent = (v) => `${(Number(v ?? 0) * 100).toFixed(1).replace(".", ",")}%`;
  const fmtDays = (v) => `${Number(v ?? 0).toFixed(1).replace(".", ",")} dias`;

  if (loading) return <p className="text-center py-10">Carregando relatório...</p>;
  if (error) return <p className="text-red-600 text-center">Erro: {error}</p>;
  if (!data || Object.keys(data).length === 0) return <p className="text-center">Nenhum dado disponível.</p>;

  return (
    <div className="space-y-8">

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardCard title="Leads Totais" value={fmtNumber(productivity?.totalLeads)} icon={FaTags} colorClass="text-indigo-600" subtext="No período filtrado" />
        <DashboardCard title="KW Vendido" value={fmtKw(productivity?.totalWonValueKW)} icon={FaDollarSign} colorClass="text-green-600" subtext="Valor Fechado" />
        <DashboardCard title="Taxa Conversão" value={fmtPercent(productivity?.conversionRate)} icon={FaChartLine} colorClass="text-blue-600" subtext="Ganho/Total" />
        <DashboardCard title="Fechamento Médio" value={fmtDays(productivity?.avgClosingTimeDays)} icon={FaClock} colorClass="text-orange-600" subtext="Tempo até o Ganho" />
      </div>

      {/* PRODUTIVIDADE + MAPA INTERATIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
          <ProductivityTable metrics={productivity} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-h-[600px]">
          <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Mapa de Clientes – Leads Ganho</h3>
          <ParanaMap leadsGanho={leadsMapa} />
        </motion.div>
      </div>

      {/* ATIVIDADE E MOTIVOS DE PERDA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DailyActivity dailyActivityData={dailyActivity} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <LostReasonsTable lostLeadsAnalysis={lostReasons} />
        </motion.div>
      </div>
    </div>
  );
}