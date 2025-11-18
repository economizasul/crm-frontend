import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaChartLine, FaTags, FaClock, FaUserTie, FaTimes, FaMapMarkedAlt } from 'react-icons/fa';

import ProductivityTable from './ProductivityTable.jsx';
import LostReasonsTable from './LostReasonsTable.jsx';
import DailyActivity from './DailyActivity.jsx';
import ParanaMap from './ParanaMap.jsx';
import { buscarLeadsGanhoParaMapa } from '../../services/ReportService';

const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-indigo-600', subtext = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
    <p className="mt-1 text-xs text-gray-400">{subtext}</p>
  </motion.div>
);

export default function ReportsDashboard({ data = {}, loading = false, error = null }) {
  const [leadsMapa, setLeadsMapa] = useState([]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState('todos');

  const productivity = data?.productivity || {};
  const vendedores = data?.vendedores || []; // Assuma que vem da API
  const filtrosBase = data?.filters || {};

  // Carrega leads com vendedor_id incluído
  useEffect(() => {
    const carregarLeads = async () => {
      const filtros = {
        ...filtrosBase,
        vendedor: vendedorSelecionado
      };
      const leads = await buscarLeadsGanhoParaMapa(filtros);
      setLeadsMapa(leads.map(l => ({ ...l, regiao: l.regiao || 'Outros' })));
    };
    if (filtrosBase.startDate) carregarLeads();
  }, [filtrosBase, vendedorSelecionado]);

  // Filtra por região
  const leadsVisiveis = regiaoSelecionada ? leadsMapa.filter(l => l.regiao === regiaoSelecionada) : leadsMapa;

  const fmtNumber = (v) => Number(v || 0).toLocaleString('pt-BR');
  const fmtKw = (v) => `${Number(v || 0).toLocaleString('pt-BR')} kW`;
  const fmtPercent = (v) => `${(Number(v || 0) * 100).toFixed(1).replace('.', ',')}%`;
  const fmtDays = (v) => `${Number(v || 0).toFixed(1).replace('.', ',')} dias`;

  if (loading) return <div className="text-center py-16">Carregando...</div>;
  if (error) return <div className="text-red-600 text-center">Erro: {error}</div>;

  return (
    <div className="space-y-6 p-4">
      {/* FILTRO POR VENDEDOR */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          <FaUserTie className="inline mr-2" /> Filtrar por Vendedor
        </label>
        <select
          value={vendedorSelecionado}
          onChange={(e) => setVendedorSelecionado(e.target.value)}
          className="w-full max-w-md p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os Vendedores ({leadsMapa.length} clientes)</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({leadsMapa.filter(l => l.vendedor_id === v.id).length} clientes)
            </option>
          ))}
        </select>
      </div>

      {/* KPIs FILTRADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Leads Totais" value={fmtNumber(productivity.totalLeads)} icon={FaTags} colorClass="text-indigo-600" />
        <DashboardCard title="KW Vendido" value={fmtKw(productivity.totalWonValueKW)} icon={FaDollarSign} colorClass="text-green-600" />
        <DashboardCard title="Taxa de Conversão" value={fmtPercent(productivity.conversionRate)} icon={FaChartLine} colorClass="text-blue-600" />
        <DashboardCard title="Tempo Médio Fechamento" value={fmtDays(productivity.avgClosingTimeDays)} icon={FaClock} colorClass="text-orange-600" />
      </div>

      {/* MAPA AVANÇADO */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaMapMarkedAlt /> Mapa de Clientes Ganho ({leadsVisiveis.length} no filtro)
          </h3>
        </div>
        <ParanaMap
          leadsGanho={leadsVisiveis}
          onRegiaoClick={setRegiaoSelecionada}
          regiaoAtiva={regiaoSelecionada}
        />
      </motion.div>

      {/* FILTRO ATIVO DE REGIÃO */}
      {regiaoSelecionada && (
        <motion.div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-center gap-2">
            <strong>Região filtrada: {regiaoSelecionada}</strong>
            <button onClick={() => setRegiaoSelecionada(null)} className="ml-auto text-blue-600 hover:text-blue-800">
              <FaTimes />
            </button>
          </div>
        </motion.div>
      )}

      {/* GRÁFICOS SECUNDÁRIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyActivity dailyActivityData={data.dailyActivity || {}} />
        <LostReasonsTable lostLeadsAnalysis={data.lostReasons || {}} />
      </div>
    </div>
  );
}