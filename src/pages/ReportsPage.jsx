// src/pages/ReportsPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useReports } from "../hooks/useReports";
import FilterBar from "../components/FilterBar.jsx";
import ProductivityTable from "../components/reports/ProductivityTable.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";

const COLORS = ["#22C55E", "#F87171", "#EAB308"]; // verde, vermelho, amarelo

const initialFilters = {
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  ownerId: "all",
  source: "all",
};

export default function ReportsPage() {
  const {
    data,
    filters,
    loading,
    error,
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
  } = useReports(initialFilters);

  const productivity = data?.productivity || {};

  const totalLeads = productivity.totalLeads || 0;
  const leadsActive = productivity.leadsActive || 0;
  const totalWonCount = productivity.totalWonCount || 0;
  const totalWonValueKW = productivity.totalWonValueKW || 0;
  const conversionRate = productivity.conversionRate || 0;
  const lossRate = productivity.lossRate || 0;
  const avgClosingTimeDays = productivity.avgClosingTimeDays || 0;

  const pieData = [
    { name: "Ganhos", value: totalWonCount },
    { name: "Perdas", value: Math.round(totalLeads * lossRate) },
    { name: "Ativos", value: leadsActive },
  ];

  const barData = [
    {
      name: "Indicadores",
      "kW Vendido": totalWonValueKW,
      "Tempo Médio (dias)": avgClosingTimeDays,
    },
  ];

  const formatKW = (v) =>
    `KW ${parseFloat(v || 0)
      .toFixed(2)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#0F172A]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Relatórios e Métricas</h1>
        </div>

        {/* Barra de Filtros */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1">
              <FilterBar
                currentFilters={filters}
                onFilterChange={updateFilter}
                onApplyFilters={applyFilters}
                isLoading={loading}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCsv}
                disabled={exporting}
                className="flex items-center gap-2 bg-[#0EA5E9] text-white px-4 py-2 rounded-xl shadow hover:bg-[#0284C7]"
              >
                <FaFileCsv />
                Exportar CSV
              </button>
              <button
                onClick={exportToPdf}
                disabled={exporting}
                className="flex items-center gap-2 bg-[#9333EA] text-white px-4 py-2 rounded-xl shadow hover:bg-[#7E22CE]"
              >
                <FaFilePdf />
                Exportar PDF
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total de Leads" value={totalLeads} color="#1E40AF" />
          <StatCard title="Leads Ativos" value={leadsActive} color="#2563EB" />
          <StatCard
            title="Vendas Concluídas"
            value={totalWonCount}
            color="#22C55E"
          />
          <StatCard
            title="Valor Total (kW)"
            value={formatKW(totalWonValueKW)}
            color="#1A7F3C"
          />
        </div>

        {/* Gráficos e tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tabela de Produtividade */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Métricas de Produtividade
            </h2>
            <ProductivityTable metrics={productivity} />
          </div>

          {/* Gráficos */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Conversão e Status
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                kW Vendido x Tempo Médio
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kW Vendido" fill="#22C55E" />
                  <Bar dataKey="Tempo Médio (dias)" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Seções futuras */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <PlaceholderSection title="Analítico de Funil por Origem" />
          <PlaceholderSection title="Relatório de Resposta e Engajamento" />
        </motion.div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-xl shadow">
            {error}
          </div>
        )}

        {/* Mensagem caso não existam dados */}
        {!data && !loading && !error && (
          <div className="mt-8 p-4 bg-white border text-gray-700 rounded-2xl shadow-sm text-center">
            📊 Use os filtros acima e clique em <b>Aplicar Filtros</b> para
            carregar o relatório.
          </div>
        )}
      </div>
    </div>
  );
}

/** --- Subcomponentes --- **/

function StatCard({ title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-5 text-center border border-gray-100"
    >
      <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
      <p
        className="text-3xl font-extrabold"
        style={{ color: color || "#0F172A" }}
      >
        {value}
      </p>
    </motion.div>
  );
}

function PlaceholderSection({ title }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>
      <p>Em breve esta área mostrará informações detalhadas.</p>
    </div>
  );
}
