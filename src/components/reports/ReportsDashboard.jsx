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

      {/* ===== NOVO LAYOUT: MAPA PEQUENO À DIREITA + CONTEÚDO À ESQUERDA ===== */}
      {/* ===== LAYOUT FINAL — COMPACTO, ALINHADO E PROFISSIONAL ===== */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ===== ESQUERDA: RESUMO DE PRODUTIVIDADE COMPACTO ===== */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-t-2xl">
          <h2 className="text-xl font-bold">Resumo de Produtividade</h2>
        </div>
        
        <div className="p-5 space-y-3 flex-1">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              
              {/* Leads Ativos */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Leads Ativos</td>
                {/* Combinamos a célula de número e descrição aqui */}
                <td className="text-left py-3">
                  <div className="font-bold text-indigo-600 text-sm md:text-base">
                    {fmtNumber(productivity.totalLeads - (productivity.totalWonCount || 0) - (productivity.totalLostCount || 0))}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Quantidade de leads cadastrados no período</div>
                </td>
              </tr>
              
              {/* Novos Cadastros */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Novos Cadastros</td>
                <td className="text-left py-3">
                  <div className="font-bold text-blue-600 text-sm md:text-base">
                    {fmtNumber(productivity.totalLeads)}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Quantidade de leads cadastrados no período</div>
                </td>
              </tr>
              
              {/* Vendas Concluídas */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Vendas Concluídas</td>
                <td className="text-left py-3">
                  <div className="font-bold text-green-600 text-sm md:text-base">
                    {fmtNumber(productivity.totalWonCount || 0)}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Númeto de leads na coluna Ganho (no periodo selecionado)</div>
                </td>
              </tr>
              
              {/* Valor Total Vendido */}
              <tr className="hover:bg-gray-50 bg-green-50 dark:bg-green-900/50">
                <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Valor Toral de KW Fechado</td>
                <td className="text-left py-3">
                  <div className="font-extrabold text-green-600 text-base md:text-lg">
                    {fmtKw(productivity.totalWonValueKW)}
                  </div>
                  <div className="text-gray-600 text-xs mt-0.5 font-medium whitespace-normal">Valor total em KW fechados no periodo.</div>
                </td>
              </tr>
              
              {/* Taxa de Conversão */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Taxa de Conversão</td>
                <td className="text-left py-3">
                  <div className="font-bold text-purple-600 text-sm md:text-base">
                    {fmtPercent(productivity.conversionRate)}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Proporção de leads fechados no periodo vs quantidade atendido.</div>
                </td>
              </tr>
        
        {/* Tempo Médio Fechamento */}
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Tempo Médio Fechamento</td>
          <td className="text-left py-3">
            <div className="font-bold text-orange-600 text-sm md:text-base">
              {(productivity.avgClosingTimeDays || 0).toFixed(1).replace('.', ',')} dias
            </div>
            <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Média de dias desde o cadastro do lead até o fechamento.</div>
          </td>
        </tr>
        
        {/* Taxa de Perda */}
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Taxa de Perda</td>
          <td className="text-left py-3">
            <div className="font-bold text-red-600 text-sm md:text-base">
              {productivity.totalLeads > 0 
                ? ((productivity.totalLostCount / productivity.totalLeads) * 100).toFixed(1).replace('.', ',')
                : '0,0'}%
            </div>
            <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Proporção de leads perdidos no periodo.</div>
          </td>
        </tr>
        
        {/* Taxa de Inaptos */}
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Taxa de Inaptos</td>
          <td className="text-left py-3">
            <div className="font-bold text-gray-600 text-sm md:text-base dark:text-gray-400">
              {productivity.totalLeads > 0
                ? Math.round(((data.funnel || []).find(s => s.stageName === 'Inapto')?.count || 0) / productivity.totalLeads * 100)
                : 0}%
            </div>
            <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Proporção de leads que não se enquadram no consumo minimo em KW.</div>
          </td>
        </tr>
        
        {/* Atendimentos Realizados */}
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="py-3 font-medium text-gray-700 dark:text-gray-300">Atendimentos Realizados</td>
          <td className="text-left py-3">
            <div className="font-bold text-teal-600 text-sm md:text-base">
              {data.globalSummary?.totalNotes || 0}
            </div>
            <div className="text-gray-500 text-xs mt-0.5 whitespace-normal">Contabiliza pela quantidade de novas anotações feitas no período.</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

        {/* ===== DIREITA: MAPA GRANDE ===== */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 text-center rounded-t-2xl">
            <h3 className="text-2xl font-bold">Mapa de Leads Fechados</h3>
            <p className="text-4xl font-extrabold mt-2">{leadsMapa.length} clientes</p>
          </div>
          
          <div className="flex-1 min-h-96">
            {carregandoMapa ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <FaSpinner className="animate-spin text-6xl text-purple-600" />
              </div>
            ) : leadsMapa.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <p className="text-gray-500 text-lg">Nenhum cliente com coordenadas</p>
              </div>
            ) : (
              <ParanaMap
                leadsGanho={leadsVisiveis}
                onRegiaoClick={setRegiaoSelecionada}
                regiaoAtiva={regiaoSelecionada}
                center={{ lat: -24.8, lng: -51.5 }}
                zoom={7}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== GRÁFICOS ABAIXO — AGORA ALINHADOS E SEM ESPAÇO VAZIO ===== */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <DailyActivity dailyActivityData={dailyActivity} />
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <LostReasonsTable lostLeadsAnalysis={lostReasons} />
        </div>
      </div>
    </div>
  );
}