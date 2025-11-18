import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaDollarSign, FaChartLine, FaTags, FaClock, FaMapMarkedAlt, FaTimes, FaUserTie } from "react-icons/fa";

import ProductivityTable from "./ProductivityTable.jsx";
import LostReasonsTable from "./LostReasonsTable.jsx";
import DailyActivity from "./DailyActivity.jsx";
import ParanaMap from "./ParanaMap.jsx";
import { buscarLeadsGanhoParaMapa } from "../../services/ReportService";

const DashboardCard = ({ title, value, icon: Icon, colorClass = "text-indigo-600", subtext = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
    className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
      <Icon className={`w-7 h-7 ${colorClass}`} />
    </div>
    <p className="mt-3 text-3xl font-extrabold text-gray-900">{value}</p>
    <p className="mt-1 text-xs text-gray-400">{subtext}</p>
  </motion.div>
);

export default function ReportsDashboard({ data = {}, loading = false, error = null }) {
  const [leadsTodos, setLeadsTodos] = useState([]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState("todos");

  const productivity = data?.productivity || {};
  const vendedores = data?.vendedores || [];

  // Carrega todos os leads ganho (sem filtro de vendedor ainda)
  useEffect(() => {
    if (!data?.filters) return;

    const carregar = async () => {
      const filtros = {
        startDate: data.filters.startDate,
        endDate: data.filters.endDate,
        vendedor: "todos"
      };
      const leads = await buscarLeadsGanhoParaMapa(filtros);
      setLeadsTodos(leads);
    };
    carregar();
  }, [data?.filters]);

  // Aplica filtros combinados
  const leadsFiltrados = leadsTodos
    .filter(l => !regiaoSelecionada || l.regiao === regiaoSelecionada)
    .filter(l => vendedorSelecionado === "todos" || l.vendedor_id === vendedorSelecionado);

  const fmtNumber = (v) => Number(v ?? 0).toLocaleString("pt-BR");
  const fmtKw = (v) => `${Number(v ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kW`;
  const fmtPercent = (v) => `${(Number(v ?? 0) * 100).toFixed(1).replace(".", ",")}%`;
  const fmtDays = (v) => `${Number(v ?? 0).toFixed(1).replace(".", ",")} dias`;

  if (loading) return <div className="text-center py-20 text-gray-600 text-lg">Carregando relatório...</div>;
  if (error) return <div className="text-red-600 text-center py-10">Erro: {error}</div>;
  if (!data) return <div className="text-center text-gray-500 py-10">Nenhum dado disponível.</div>;

  return (
    <div className="space-y-8">

      {/* FILTROS ATIVOS */}
      {(regiaoSelecionada || vendedorSelecionado !== "todos") && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-2xl shadow-2xl flex flex-wrap items-center gap-4 justify-between"
        >
          <div className="flex flex-wrap items-center gap-4">
            {regiaoSelecionada && (
              <span className="bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2">
                <FaMapMarkedAlt /> {regiaoSelecionada}
                <button onClick={() => setRegiaoSelecionada(null)} className="ml-2 hover:bg-white/30 rounded-full p-1">
                  <FaTimes />
                </button>
              </span>
            )}
            {vendedorSelecionado !== "todos" && (
              <span className="bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2">
                <FaUserTie /> {vendedores.find(v => v.id === vendedorSelecionado)?.name || "Vendedor"}
                <button onClick={() => setVendedorSelecionado("todos")} className="ml-2 hover:bg-white/30 rounded-full p-1">
                  <FaTimes />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => { setRegiaoSelecionada(null); setVendedorSelecionado("todos"); }}
            className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Limpar todos os filtros
          </button>
        </motion.div>
      )}

      {/* FILTRO POR VENDEDOR */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaUserTie className="text-indigo-600" /> Filtrar por Vendedor
        </label>
        <select
          value={vendedorSelecionado}
          onChange={(e) => setVendedorSelecionado(e.target.value)}
          className="w-full md:w-96 px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-gray-800 font-medium"
        >
          <option value="todos">Todos os vendedores</option>
          {vendedores.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardCard title="Leads Totais" value={fmtNumber(productivity.totalLeads)} icon={FaTags} colorClass="text-indigo-600" />
        <DashboardCard title="KW Vendido" value={fmtKw(productivity.totalWonValueKW)} icon={FaDollarSign} colorClass="text-green-600" />
        <DashboardCard title="Taxa de Conversão" value={fmtPercent(productivity.conversionRate)} icon={FaChartLine} colorClass="text-blue-600" />
        <DashboardCard title="Tempo Médio de Fechamento" value={fmtDays(productivity.avgClosingTimeDays)} icon={FaClock} colorClass="text-orange-600" />
      </div>

      {/* MAPA AVANÇADO + PRODUTIVIDADE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <ProductivityTable metrics={productivity} />
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaMapMarkedAlt className="text-indigo-600" />
              Mapa Interativo do Paraná
              <span className="text-sm font-normal text-gray-500">
                ({leadsFiltrados.length} cliente{leadsFiltrados.length !== 1 ? 's' : ''} ganho{leadsFiltrados.length !== 1 ? 's' : ''})
              </span>
            </h3>
          </div>
          <div className="p-4">
            <ParanaMap
              leadsGanho={leadsFiltrados}
              onRegiaoClick={setRegiaoSelecionada}
              regiaoAtiva={regiaoSelecionada}
            />
          </div>
        </div>
      </div>

      {/* OUTROS GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyActivity dailyActivityData={data.dailyActivity} />
        <LostReasonsTable lostLeadsAnalysis={data.lostReasons} />
      </div>
    </div>
  );
}