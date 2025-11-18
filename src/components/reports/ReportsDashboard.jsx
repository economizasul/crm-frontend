import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaDollarSign, FaChartLine, FaTags, FaClock } from "react-icons/fa";

import ProductivityTable from "./ProductivityTable.jsx";
import LostReasonsTable from "./LostReasonsTable.jsx";
import DailyActivity from "./DailyActivity.jsx";
import GeoMap from "./GeoMap.jsx";

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

  // ✅ Hooks sempre chamados
  const mapLocations = data?.mapLocations || [];
  const productivity = data?.productivity || {};
  const lostReasons = data?.lostReasons || {};
  const dailyActivity = data?.dailyActivity || {};

  const handleExpand = useCallback(() => {
    navigate("/full-map", { state: { locations: mapLocations } });
  }, [navigate, mapLocations]);

  const fmtNumber = (v) => Number(v ?? 0).toLocaleString("pt-BR");
  const fmtKw = (v) => `${Number(v ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kW`;
  const fmtPercent = (v) => `${(Number(v ?? 0) * 100).toFixed(1).replace(".", ",")}%`;
  const fmtDays = (v) => `${Number(v ?? 0).toFixed(1).replace(".", ",")} dias`;

  // ✅ Retorno condicional seguro
  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-600">Erro ao carregar o relatório: {error}</p>;
  if (!data || Object.keys(data).length === 0) return <p>Nenhum dado disponível.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardCard title="Leads Totais" value={fmtNumber(productivity?.totalLeads)} icon={FaTags} colorClass="text-indigo-600" subtext="No período filtrado" />
        <DashboardCard title="KW Vendido" value={fmtKw(productivity?.totalWonValueKW)} icon={FaDollarSign} colorClass="text-green-600" subtext="Valor Fechado" />
        <DashboardCard title="Taxa Conversão" value={fmtPercent(productivity?.conversionRate)} icon={FaChartLine} colorClass="text-blue-600" subtext="Ganho/Total" />
        <DashboardCard title="Fechamento Médio" value={fmtDays(productivity?.avgClosingTimeDays)} icon={FaClock} colorClass="text-orange-600" subtext="Tempo até o Ganho" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-1">
          <ProductivityTable metrics={productivity} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2 min-h-[500px]">
          <GeoMap
            locations={mapLocations}
            initialCenter={[-24.5, -51.5]}
            initialZoom={7}
            minRadius={6}
            maxRadius={28}
            onExpand={handleExpand}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <DailyActivity dailyActivityData={dailyActivity} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <LostReasonsTable lostLeadsAnalysis={lostReasons} />
        </motion.div>
      </div>
    </div>
  );
}
