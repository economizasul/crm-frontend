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

  // MAPA — FORÇADO E COM LOG OBRIGATÓRIO
  useEffect(() => {
    console.log('EXECUTANDO BUSCA DE LEADS PARA O MAPA AGORA...');

    const carregarMapa = async () => {
      try {
        setCarregandoMapa(true);
        console.log('Chamando /api/v1/reports/leads-ganho-mapa...');

        const response = await fetch('https://crm-app-cnf7.onrender.com/api/v1/reports/leads-ganho-mapa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // pega o token do login
          },
          body: JSON.stringify({ filters: {} })
        });

        const json = await response.json();
        console.log('RESPOSTA COMPLETA DO MAPA:', json);

        if (json.success && Array.isArray(json.data)) {
          const leadsFiltrados = json.data
            .filter(l => l.lat && l.lng)
            .map(l => ({
              ...l,
              lat: parseFloat(l.lat),
              lng: parseFloat(l.lng),
              regiao: l.regiao || 'Outros',
              cidade: l.cidade || 'Cidade não informada'
            }));
          console.log('LEADS VÁLIDOS PARA O MAPA:', leadsFiltrados);
          setLeadsMapa(leadsFiltrados);
        } else {
          console.log('Nenhum lead retornado ou erro na resposta');
          setLeadsMapa([]);
        }
      } catch (err) {
        console.error('ERRO FORÇADO NO MAPA:', err);
        setLeadsMapa([]);
      } finally {
        setCarregandoMapa(false);
      }
    };

    carregarMapa();
  }, []);

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
    <div className="space-y-8 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">

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

      {/* ===== NOVO LAYOUT: MAPA PEQUENO À DIREITA + CONTEÚDO À ESQUERDA ===== */}
      {/* ===== LAYOUT FINAL — RESUMO TERMINA COLADINHO + FUNIL PERFEITO ===== */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start auto-rows-min">

        {/* ===== RESUMO DE PRODUTIVIDADE ===== */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible self-start">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-t-2xl">
            <h2 className="text-xl font-bold">Resumo de Produtividade</h2>
          </div>

          <div className="px-5 pt-4 pb-0">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Leads Ativos</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-indigo-600 text-base">
                      {fmtNumber(productivity.totalLeads - (productivity.totalWonCount || 0) - (productivity.totalLostCount || 0))}
                    </span>
                    <span className="text-gray-500 text-xs">em atendimento</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Novos Cadastros</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-blue-600 text-base">{fmtNumber(productivity.totalLeads)}</span>
                    <span className="text-gray-500 text-xs">no período</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Vendas Concluídas</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-green-600 text-base">{fmtNumber(productivity.totalWonCount || 0)}</span>
                    <span className="text-gray-500 text-xs">status Ganho</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Total de kW Fechado</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-extrabold text-green-600 text-lg">{fmtKw(productivity.totalWonValueKW)}</span>
                    <span className="text-gray-500 font-medium text-xs">kW fechados no período</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Taxa de Conversão</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-purple-600 text-base">{fmtPercent(productivity.conversionRate)}</span>
                    <span className="text-gray-500 text-xs">leads → vendas</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Fechamento Médio</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-orange-600 text-base">
                      {(productivity.avgClosingTimeDays || 0).toFixed(1).replace('.', ',')} dias
                    </span>
                    <span className="text-gray-500 text-xs">cadastro → ganho</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Taxa de Perda</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-red-600 text-base">
                      {productivity.totalLeads > 0 ? ((productivity.totalLostCount / productivity.totalLeads) * 100).toFixed(1).replace('.', ',') : '0,0'}%
                    </span>
                    <span className="text-gray-500 text-xs">status Perdido</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Taxa de Inaptos</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-gray-600 text-base">
                      {productivity.totalLeads > 0 ? Math.round(((data.funnel || []).find(s => s.stageName === 'Inapto')?.count || 0) / productivity.totalLeads * 100) : 0}%
                    </span>
                    <span className="text-gray-500 text-xs">fora do perfil</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-700 whitespace-nowrap">Atendimentos Realizados</td>
                <td className="text-left py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-teal-600 text-base">
                      {data.globalSummary?.totalNotes || 0}
                    </span>
                    <span className="text-gray-500 text-xs">novas anotações</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MAPA ===== */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col self-start">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 text-center rounded-t-2xl">
          <h3 className="text-2xl font-bold">Mapa de Leads Fechados</h3>
          <p className="text-2xl font-extrabold mt-2">{leadsMapa.length} clientes</p>
        </div>

        {/* 🔥 Altura controlada, não quebra layout, não corta conteúdo */}
        <div>
          {carregandoMapa ? (
            <div className="flex items-center justify-center bg-gray-50 py-6">
              <FaSpinner className="animate-spin text-6xl text-purple-600" />
            </div>
          ) : leadsMapa.length === 0 ? (
            <div className="flex items-center justify-center bg-gray-50 py-6">
              <p className="text-lg text-gray-500">Nenhum cliente com coordenadas</p>
            </div>
          ) : (
            <div className="w-full" style={{ minHeight: 280 }}>
              <ParanaMap
                leadsGanho={leadsVisiveis}
                onRegiaoClick={setRegiaoSelecionada}
                regiaoAtiva={regiaoSelecionada}
                center={{ lat: -24.8, lng: -51.5 }}
                zoom={7}
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ===== FUNIL + MOTIVOS DE PERDA ===== */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-6">Origem do Lead</h3>
          <div className="space-y-2 max-w-xs mx-auto">
            {[
              { label: 'Orgânico',   field: 'organico',   color: 'bg-gray-600' },
              { label: 'Indicação',  field: 'indicacao',  color: 'bg-blue-600' },
              { label: 'Facebook',   field: 'facebook',   color: 'bg-indigo-600' },
              { label: 'Google',     field: 'google',     color: 'bg-red-600' },
              { label: 'Instagram',  field: 'instagram',  color: 'bg-pink-600' },
              { label: 'Parceria',   field: 'parceria',   color: 'bg-green-600' }
            ]
              .map(item => ({ ...item, value: data.originStats?.[item.field] || 0 }))
              .sort((a, b) => b.value - a.value)
              .map((item, index) => {
                const percent = productivity.totalLeads > 0 
                  ? (item.value / productivity.totalLeads * 100).toFixed(1) 
                  : '0.0';
                const width = 100 - (index * 13);
                return (
                  <div
                    key={item.field}
                    className={`h-11 ${item.color} rounded-lg shadow-sm flex items-center justify-between px-5 text-white`}
                    style={{ width: `${width}%`, margin: '0 auto' }}
                  >
                    <span className="text-sm font-semibold">{item.label}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold">{item.value}</span>
                      <span className="text-xs ml-2 opacity-90">{percent}%</span>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="text-center mt-6">
            <div className="text-3xl font-extrabold text-gray-800">
              {fmtNumber(productivity.totalLeads)}
            </div>
            <div className="text-sm text-gray-600">Total de leads no período</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <LostReasonsTable lostLeadsAnalysis={lostReasons} />
        </div>
      </div>
    </div>
  );
}