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
  </div>
);

const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', subtext = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 h-[56px] flex flex-col justify-center"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">{title}</h3>
      <Icon className={`w-5 h-5 ${colorClass}`} />
    </div>

    <motion.p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white leading-tight">
      {value}
    </motion.p>

    <p className="mt-0 text-[10px] text-gray-400 dark:text-gray-500">{subtext}</p>
  </motion.div>
);


export default function ReportsDashboard({ data, loading = false, error = null }) {
  const [leadsMapa, setLeadsMapa] = useState([]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState('todos');
  const [carregandoMapa, setCarregandoMapa] = useState(true);

  // PROTEÇÃO TOTAL CONTRA DADOS NULOS
  const productivity = data?.productivity || {};
  const dailyActivity = data?.dailyActivity || {};
  const lostReasons = data?.lostReasons || {};
  const vendedores = data?.vendedores || [];
  const filtrosBase = data?.filters || {};

  // MAPA — VERSÃO 100% SEGURA
  useEffect(() => {
    if (!data || !data.leads || !Array.isArray(data.leads)) {
      setLeadsMapa([]);
      setCarregandoMapa(false);
      return;
    }

    const leadsGanho = data.leads
      .filter(lead => lead?.status === 'Ganho')  // EXATO como está no seu banco
      .map(lead => ({
        ...lead,
        regiao: lead.regiao || 'Desconhecida',
        cidade: lead.cidade || 'Não informada',
        lat: lead.lat ? parseFloat(lead.lat) : null,
        lng: lead.lng ? parseFloat(lead.lng) : null,
      }))
      .filter(lead => lead.lat !== null && lead.lng !== null);

    console.log('Leads no mapa (deve ser 3):', leadsGanho);

    setLeadsMapa(leadsGanho);
    setCarregandoMapa(false);
  }, [data]);

      //console.log('Status encontrados nos leads:', [...new Set(data.leads.map(l => l.status))]);

  const leadsVisiveis = regiaoSelecionada
    ? leadsMapa.filter(l => l.regiao === regiaoSelecionada)
    : leadsMapa;

  const fmtNumber = (v) => Number(v || 0).toLocaleString('pt-BR');
  const fmtKw = (v) => `${Number(v || 0).toLocaleString('pt-BR')} kW`;
  const fmtPercent = (v) => `${(Number(v || 0) * 100).toFixed(1).replace('.', ',')}%`;
  const fmtDays = (v) => `${Number(v || 0).toFixed(1).replace('.', ',')} dias`;

  // ESTADOS DE CARREGAMENTO
  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-6xl text-indigo-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-300">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar relatório</p>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center">
        <p className="text-xl text-gray-500">Nenhum dado disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* FILTRO REGIÃO — só aparece quando selecionar uma região */}
      <AnimatePresence>
        {regiaoSelecionada && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-xl flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-4">
              <FaMapMarkedAlt className="text-3xl" />
              <div>
                <strong className="text-xl">Região: {regiaoSelecionada}</strong>
                <p className="text-sm opacity-90">{leadsVisiveis.length} clientes</p>
              </div>
            </div>
            <button onClick={() => setRegiaoSelecionada(null)}>
              <FaTimes className="text-2xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>



      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
  <DashboardCard
    title="Leads Totais"
    value={fmtNumber(productivity.totalLeads)}
    icon={FaTags}
    colorClass="text-indigo-600 dark:text-indigo-400"
  />

  <DashboardCard
    title="KW Vendido"
    value={fmtKw(productivity.totalWonValueKW)}
    icon={FaDollarSign}
    colorClass="text-green-600 dark:text-green-400"
  />

  <DashboardCard
    title="Taxa Conversão"
    value={fmtPercent(productivity.conversionRate)}
    icon={FaChartLine}
    colorClass="text-blue-600 dark:text-blue-400"
  />

  {/* 🔥 NOVO KPI: Tempo Médio de Fechamento em Horas */}
  <DashboardCard
    title="Tempo Médio Fechamento"
    value={`${Number(data.globalSummary?.tempoMedioFechamentoHoras || 0).toFixed(1).replace('.', ',')} h`}
    icon={FaClock}
    colorClass="text-orange-600 dark:text-orange-400"
  />

  {/* 🔥 NOVO KPI: Tempo Médio de Atendimento */}
  <DashboardCard
    title="Tempo Médio Atendimento"
    value={`${Number(data.globalSummary?.tempoMedioAtendimentoHoras || 0).toFixed(1).replace('.', ',')} h`}
    icon={FaUserTie}
    colorClass="text-purple-600 dark:text-purple-400"
  />
</div>

      {/* MAPA DO PARANÁ — VERSÃO FINAL FUNCIONANDO */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-b">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <FaMapMarkedAlt className="text-indigo-600 dark:text-indigo-400" />
            Mapa de Clientes Fechados ({leadsMapa.length} clientes)
          </h3>
        </div>

        {carregandoMapa ? (
          <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <FaSpinner className="animate-spin text-5xl text-indigo-600" />
            <span className="ml-4 text-gray-600">Carregando mapa...</span>
          </div>
        ) : leadsMapa.length === 0 ? (
          <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-500">Nenhum cliente fechado com coordenadas</p>
          </div>
        ) : (
          <ParanaMap
            leadsGanho={leadsVisiveis}
            onRegiaoClick={setRegiaoSelecionada}
            regiaoAtiva={regiaoSelecionada}
          />
        )}
      </motion.div>

      {/* GRÁFICOS FINAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyActivity dailyActivityData={dailyActivity} />
        <LostReasonsTable lostLeadsAnalysis={lostReasons} />
      </div>
    </div>
  );
}