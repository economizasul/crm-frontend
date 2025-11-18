// src/components/reports/ReportsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaTags, FaClock, FaUserTie, FaTimes, FaMapMarkedAlt, FaSpinner } from 'react-icons/fa';

import ProductivityTable from './ProductivityTable.jsx';
import LostReasonsTable from './LostReasonsTable.jsx';
import DailyActivity from './DailyActivity.jsx';
import ParanaMap from './ParanaMap.jsx';
import { buscarLeadsGanhoParaMapa } from '../../services/ReportService';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
    <div className="h-10 bg-gray-400 dark:bg-gray-500 rounded w-24"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mt-3"></div>
  </div>
);

const SkeletonMap = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
    <div className="p-6 border-b bg-gray-50 dark:bg-gray-900">
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64"></div>
    </div>
    <div className="relative h-96 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-5xl text-indigo-500 dark:text-indigo-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">Carregando mapa...</p>
      </div>
    </div>
  </div>
);

const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', subtext = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
      <Icon className={`w-8 h-8 ${colorClass} opacity-90`} />
    </div>
    <motion.p 
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white"
    >
      {value}
    </motion.p>
    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{subtext}</p>
  </motion.div>
);

export default function ReportsDashboard({ data = {}, loading = false, error = null }) {
  const [leadsMapa, setLeadsMapa] = useState([]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState('todos');
  const [carregandoMapa, setCarregandoMapa] = useState(true);

  const productivity = data?.productivity || {};
  const vendedores = data?.vendedores || [];
  const filtrosBase = data?.filters || {};

  useEffect(() => {
    const carregarLeads = async () => {
      setCarregandoMapa(true);
      try {
        const filtros = { ...filtrosBase, vendedor: vendedorSelecionado === 'todos' ? null : vendedorSelecionado };
        const leads = await buscarLeadsGanhoParaMapa(filtros);
        setLeadsMapa(leads.map(l => ({ ...l, regiao: l.regiao || 'Outros' })));
      } finally {
        setTimeout(() => setCarregandoMapa(false), 800);
      }
    };
    if (filtrosBase.startDate && !loading) carregarLeads();
  }, [filtrosBase, vendedorSelecionado, loading]);

  const leadsVisiveis = regiaoSelecionada 
    ? leadsMapa.filter(l => l.regiao === regiaoSelecionada)
    : leadsMapa;

  const fmtNumber = (v) => Number(v || 0).toLocaleString('pt-BR');
  const fmtKw = (v) => `${Number(v || 0).toLocaleString('pt-BR')} kW`;
  const fmtPercent = (v) => `${(Number(v || 0) * 100).toFixed(1).replace('.', ',')}%`;
  const fmtDays = (v) => `${Number(v || 0).toFixed(1).replace('.', ',')} dias`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl animate-pulse border border-gray-200 dark:border-gray-700">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-2">
            <SkeletonMap />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">

      {/* FILTRO POR VENDEDOR */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 p-6 rounded-2xl shadow-2xl border border-indigo-400/20"
      >
        <label className="text-lg font-bold flex items-center gap-3 text-white">
          <FaUserTie className="text-2xl" /> Filtrar por Vendedor
        </label>
        <select
          value={vendedorSelecionado}
          onChange={(e) => setVendedorSelecionado(e.target.value)}
          className="mt-4 w-full max-w-md p-4 rounded-xl bg-white/20 dark:bg-black/30 text-white placeholder-white/70 border border-white/30 focus:ring-4 focus:ring-white/50 outline-none text-lg backdrop-blur-sm"
        >
          <option value="todos">Todos os Vendedores ({leadsMapa.length} clientes)</option>
          {vendedores.map(v => (
            <option key={v.id} value={v.id} className="text-gray-800 dark:text-gray-200">
              {v.name} ({leadsMapa.filter(l => l.vendedor_id === v.id).length} clientes)
            </option>
          ))}
        </select>
      </motion.div>

      {/* FILTRO ATIVO DE REGIÃO */}
      <AnimatePresence>
        {regiaoSelecionada && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800 p-5 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/30"
          >
            <div className="flex items-center gap-4 text-white">
              <FaMapMarkedAlt className="text-3xl" />
              <div>
                <strong className="text-xl">Região: {regiaoSelecionada}</strong>
                <p className="text-sm opacity-90 mt-1">
                  {leadsVisiveis.length} cliente{leadsVisiveis.length !== 1 ? 's' : ''} ganho{leadsVisiveis.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button onClick={() => setRegiaoSelecionada(null)} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl">
              <FaTimes className="text-xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Leads Totais" value={fmtNumber(productivity.totalLeads)} icon={FaTags} colorClass="text-indigo-600 dark:text-indigo-400" />
        <DashboardCard title="KW Vendido" value={fmtKw(productivity.totalWonValueKW)} icon={FaDollarSign} colorClass="text-green-600 dark:text-green-400" />
        <DashboardCard title="Taxa de Conversão" value={fmtPercent(productivity.conversionRate)} icon={FaChartLine} colorClass="text-blue-600 dark:text-blue-400" />
        <DashboardCard title="Tempo Médio" value={fmtDays(productivity.avgClosingTimeDays)} icon={FaClock} colorClass="text-orange-600 dark:text-orange-400" />
      </motion.div>

      {/* MAPA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <FaMapMarkedAlt className="text-indigo-600 dark:text-indigo-400" />
            Mapa Interativo do Paraná
            <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-3">
              ({leadsVisiveis.length} cliente{leadsVisiveis.length !== 1 ? 's' : ''})
            </span>
          </h3>
        </div>
        <div className="relative">
          {carregandoMapa ? <SkeletonMap /> : (
            <ParanaMap leadsGanho={leadsVisiveis} onRegiaoClick={setRegiaoSelecionada} regiaoAtiva={regiaoSelecionada} />
          )}
        </div>
      </motion.div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <DailyActivity dailyActivityData={data.dailyActivity || {}} />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <LostReasonsTable lostLeadsAnalysis={data.lostReasons || {}} />
        </motion.div>
      </div>
    </div>
  );
}