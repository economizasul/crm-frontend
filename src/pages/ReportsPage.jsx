// src/pages/ReportsPage.jsx (CÓDIGO CORRIGIDO - Usando axios direto)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { FaSync } from 'react-icons/fa'; 
import axios from 'axios'; // 🎯 NOVO: Importa axios
import { format } from 'date-fns'; // Para formatação de data de exportação

// 🎯 NOVO: Define a Base URL diretamente, pois api.js não existe
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

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
    // CRÍTICO: Não executa se não houver token (embora o middleware trate, é bom evitar)
    if (!token) {
        setError("Não autenticado. Por favor, faça login.");
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // 🎯 CORREÇÃO CRÍTICA: Usa axios diretamente com a URL completa
      const res = await axios.get(`${API_BASE_URL}/api/v1/reports/dashboard-data`, {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }, // 🎯 token passado diretamente
      });

      setDashboardData(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Sessão expirada ou acesso negado. Faça login novamente.');
      } else {
          // O erro de conexão / TypeError de antes cairia aqui
          setError('Não foi possível carregar os dados. Verifique a conexão ou tente novamente.');
      }
      setDashboardData(null); 
    } finally {
      setLoading(false); // GARANTE QUE SEMPRE DESATIVA O LOADING
    }
  }, [token]); 


  // Função para buscar lista de vendedores e origens
  const fetchFilters = useCallback(async () => {
    if (!token) return;

    try {
      // 🎯 CORREÇÃO CRÍTICA: Usa axios diretamente com a URL completa
      const sellersRes = await axios.get(`${API_BASE_URL}/api/v1/reports/sellers`, {
        headers: { Authorization: `Bearer ${token}` }, // 🎯 token passado diretamente
      });
      setVendedores(sellersRes.data);
      setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Cold Call', 'Outro']);
    } catch (e) {
      console.error('Erro ao buscar filtros:', e);
      // Aqui não precisamos setar loading, pois a chamada principal fará isso
    }
  }, [token]); 


  // ====================================================================
  // EFEITOS DE CONTROLE
  // ====================================================================

  // Efeito na Montagem: Busca filtros e, em seguida, os dados iniciais
  useEffect(() => {
    // Busca os dados APENAS se tivermos um token
    if (token) {
        fetchFilters();
        fetchDashboardData(currentFilters); 
    } else {
        setLoading(false); // Se não tem token, não carrega e finaliza o loading
        setError("Você precisa estar logado para ver os relatórios.");
    }
  }, [token, fetchFilters, fetchDashboardData, currentFilters]);


  // 2. Efeito para APLICAR FILTROS (é o botão de pesquisa/aplicar)
  const applyFilters = () => {
    fetchDashboardData(currentFilters); // Aplica filtros atuais (do useMemo)
  };


  // ====================================================================
  // LÓGICA DE EXPORTAÇÃO
  // ====================================================================

  const handleExport = async (formatType) => {
    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/reports/export`, {
            params: { ...currentFilters, format: formatType },
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob', // CRÍTICO para receber binário (PDF/CSV)
        });

        // Lógica de download (Mantida e Correta)
        const content = response.headers['content-disposition'];
        const filenameMatch = content && content.match(/filename\*?=['"]?(?:UTF-8'')?([^"']*)['"]?/i);
        const filename = filenameMatch && filenameMatch[1] ? decodeURIComponent(filenameMatch[1]) : `report_${format(new Date(), 'yyyyMMdd')}.${formatType}`;

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro na exportação:', error);
        alert('Erro ao exportar relatório. Tente novamente.');
    }
  };
  
  // ====================================================================
  // RENDERIZAÇÃO
  // ====================================================================

  return (
    <div className="p-6">
      {/* ... Restante do JSX (filtros e botões) ... */}

      {/* RENDERIZAÇÃO CONDICIONAL */}
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