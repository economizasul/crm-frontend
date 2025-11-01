// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard';

const ReportsPage = () => {
  const { user } = useAuth();

  const [vendedores, setVendedores] = useState([]);
  const [vendedorId, setVendedorId] = useState(
    user?.relatorios_proprios_only ? user.id : ''
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [availableOrigins, setAvailableOrigins] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilters = useCallback(async () => {
    try {
      const sellersRes = await api.get('/api/reports/sellers');
      setVendedores(sellersRes.data);
      setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Parceria']);
    } catch (err) {
      console.error('Erro ao buscar filtros:', err.response || err);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = {
      ownerId: vendedorId,
      startDate: startDate || null,
      endDate: endDate || null,
      origin: originFilter,
    };

    try {
      const res = await api.get('/api/reports/dashboard-data', { params });

      if (
        res.status === 204 ||
        !res.data ||
        Object.keys(res.data).length === 0 ||
        res.data.newLeads === undefined
      ) {
        setDashboardData(null);
        setError('Nenhum dado encontrado para os filtros selecionados.');
      } else {
        setDashboardData(res.data);
        setError(null);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do Dashboard:', err.response || err);
      const status = err.response?.status;
      let errorMessage = 'Erro na comunicação com o servidor.';

      if (status === 401 || status === 403)
        errorMessage = 'Sessão expirada. Faça login novamente.';
      else if (status === 500)
        errorMessage = 'Erro interno do servidor (500).';
      else if (status === 404)
        errorMessage = 'A rota /api/reports/dashboard-data não foi encontrada.';

      setError(errorMessage);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [vendedorId, startDate, endDate, originFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = async (format) => {
    const params = {
      format,
      ownerId: vendedorId,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      const response = await api.get('/api/reports/export', {
        params,
        responseType: 'blob',
      });

      if (response.status === 204) {
        return alert('Nenhum dado encontrado para exportação.');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `relatorio_${format}_${Date.now()}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Erro ao exportar ${format}:`, err);
      alert(`Erro ao exportar relatório em ${format}.`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard de Performance
        </h1>

        <div>
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow mr-2"
          >
            Exportar (CSV)
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow"
          >
            Gerar PDF
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Início:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fim:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vendedor:
          </label>
          {user?.relatorios_proprios_only ? (
            <input
              type="text"
              value={user.name}
              disabled
              className="mt-1 block px-3 py-2 border rounded bg-gray-100"
            />
          ) : (
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="mt-1 block px-3 py-2 border rounded-md"
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Origem:
          </label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="mt-1 block px-3 py-2 border rounded-md"
          >
            <option value="">Todas</option>
            {availableOrigins.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading && (
          <p className="text-center text-blue-500">
            Carregando dados do dashboard...
          </p>
        )}
        {!loading && error && (
          <p className="text-center text-red-500 font-medium">{error}</p>
        )}
        {!loading && dashboardData && !error && (
          <ReportsDashboard data={dashboardData} />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
