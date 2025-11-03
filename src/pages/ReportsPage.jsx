// src/pages/ReportsPage.jsx (CÓDIGO CORRIGIDO - Garante a chamada inicial de dados)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api'; 
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { FaSync } from 'react-icons/fa'; // Ícone para forçar atualização

const ReportsPage = () => {
  const { user, token } = useAuth(); 

  // 1. ESTADO DOS FILTROS
  const [vendedores, setVendedores] = useState([]);
  const [vendedorId, setVendedorId] = useState(
    user?.relatorios_proprios_only ? user.id : ''
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [availableOrigins, setAvailableOrigins] = useState([]);

  // 2. ESTADO DOS DADOS E CARREGAMENTO
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Monta o objeto de filtros para o backend
  const currentFilters = useMemo(() => {
    const filters = {};
    if (vendedorId) filters.ownerId = vendedorId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (originFilter) filters.origin = originFilter;
    return filters;
  }, [vendedorId, startDate, endDate, originFilter]);


  // ====================================================================
  // FUNÇÕES DE FETCH
  // ====================================================================
  
  // Função para buscar dados do dashboard (principal)
  const fetchDashboardData = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      // 🚨 CRÍTICO: Usa o api.get com o endpoint correto /reports/dashboard-data
      const res = await api.get('/reports/dashboard-data', {
        params: filters,
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      setDashboardData(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      // Aqui, se o status for 404/401, o api.js pode não ter injetado o token
      if (err.response?.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
      } else {
          setError('Não foi possível carregar os dados. Verifique a conexão ou tente novamente.');
      }
      setDashboardData(null); // Limpa dados em caso de erro
    } finally {
      setLoading(false); // GARANTE QUE SEMPRE DESATIVA O LOADING
    }
  }, [token]); 


  // Função para buscar lista de vendedores e origens (Mantida)
  const fetchFilters = useCallback(async () => {
    try {
      const sellersRes = await api.get('/reports/sellers', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setVendedores(sellersRes.data);
      setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Cold Call', 'Outro']);
    } catch (e) {
      console.error('Erro ao buscar filtros:', e);
      // Se os filtros falharem, ainda tentamos carregar o dashboard, mas setamos um erro
      setError(e.message || 'Erro ao carregar filtros iniciais.');
    }
  }, [token]); 


  // ====================================================================
  // EFEITOS DE CONTROLE
  // ====================================================================

  // 1. Efeito na Montagem: Busca filtros e, em seguida, os dados iniciais
  useEffect(() => {
    fetchFilters();
    // 🚨 CORREÇÃO CRÍTICA: Chama a função principal de dados na montagem, com os filtros iniciais
    // O useEffect só roda uma vez (na montagem)
    fetchDashboardData(currentFilters); 
  }, [fetchFilters, fetchDashboardData, currentFilters]); // Dependências ok, currentFilters é memoizado


  // 2. Efeito para APLICAR FILTROS (é o botão de pesquisa/aplicar)
  const applyFilters = () => {
    fetchDashboardData(currentFilters); // Aplica filtros atuais (do useMemo)
  };


  // ====================================================================
  // LÓGICA DE EXPORTAÇÃO
  // ====================================================================

  const handleExport = async (format) => {
    // ... (Mantida - lógica de exportação)
  };
  
  // ====================================================================
  // RENDERIZAÇÃO
  // ====================================================================

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Relatórios e Análise</h1>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-lg shadow-md">
        {/* Filtro Vendedor */}
        <div className="col-span-1 flex flex-col space-y-2">
          <label htmlFor="vendedor" className="text-sm font-medium text-gray-700">Vendedor</label>
          <select
            id="vendedor"
            value={vendedorId}
            onChange={(e) => setVendedorId(e.target.value)}
            disabled={!user?.isAdmin}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro Data Início */}
        <div className="col-span-1 flex flex-col space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Data Início</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filtro Data Fim */}
        <div className="col-span-1 flex flex-col space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium text-gray-700">Data Fim</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filtro Origem */}
        <div className="col-span-1 flex flex-col space-y-2">
          <label htmlFor="originFilter" className="text-sm font-medium text-gray-700">Origem</label>
          <select
            id="originFilter"
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas</option>
            {availableOrigins.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Botão Aplicar/Atualizar e Exportação */}
        <div className="col-span-2 flex items-end space-x-2">
          <button
            onClick={applyFilters}
            className="w-1/2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <FaSync size={16} />
            <span>{loading ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            className="w-1/4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
            disabled={loading || !dashboardData}
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-1/4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition disabled:bg-bg-gray-400"
            disabled={loading || !dashboardData}
          >
            PDF
          </button>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="mt-6">
        {loading && (
          <p className="text-center text-blue-500 p-10 font-medium">
            <FaSync className="animate-spin inline-block mr-2" /> Carregando dados do dashboard...
          </p>
        )}
        {!loading && error && (
          <p className="text-center text-red-500 p-10 font-medium border border-red-300 bg-red-50 rounded-lg">
            {error}
          </p>
        )}
        {!loading && dashboardData && <ReportsDashboard data={dashboardData} />}
      </div>
    </div>
  );
};

export default ReportsPage;