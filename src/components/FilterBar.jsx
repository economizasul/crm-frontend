// src/components/FilterBar.jsx
import React, { useEffect, useState } from 'react';
import { FaFileCsv, FaFilePdf, FaFilter } from 'react-icons/fa';
import api from '../services/api';

function FilterBar({
  currentFilters,
  onFilterChange,
  onApplyFilters,
  exportToCsv,
  exportToPdf,
  isExporting,
  isLoading,
}) {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Carrega vendedores reais do backend
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoadingVendors(true);
        setError(null);
        const res = await api.get('/reports/sellers');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setVendors([{ id: 'all', name: 'Todos os Vendedores' }, ...res.data.data]);
        } else {
          throw new Error('Resposta inesperada da API de vendedores.');
        }
      } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
        setError('Falha ao carregar vendedores.');
      } finally {
        setLoadingVendors(false);
      }
    };
    loadVendors();
  }, []);

  const sources = [
    { id: 'all', name: 'Todas as Fontes' },
    { id: 'google', name: 'Google Ads' },
    { id: 'facebook', name: 'Facebook/Instagram' },
    { id: 'organic', name: 'Orgânico' },
    { id: 'parceria', name: 'Portal Itaipu' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">

        {/* Data Inicial */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">De (Data Inicial)</label>
          <input
            type="date"
            value={currentFilters.startDate || ''}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        {/* Data Final */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Até (Data Final)</label>
          <input
            type="date"
            value={currentFilters.endDate || ''}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        {/* Vendedor */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Vendedor</label>
          <select
            value={currentFilters.ownerId || 'all'}
            onChange={(e) => onFilterChange('ownerId', e.target.value)}
            disabled={loadingVendors}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            {loadingVendors && <option>Carregando vendedores...</option>}
            {!loadingVendors &&
              vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
          </select>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Fonte */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Fonte</label>
          <select
            value={currentFilters.source || 'all'}
            onChange={(e) => onFilterChange('source', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={onApplyFilters}
            disabled={isLoading || isExporting}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition duration-150"
          >
            <FaFilter className="mr-2" />
            {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
          </button>

          <button
            onClick={exportToCsv}
            disabled={isExporting || isLoading}
            title="Exportar CSV"
            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            <FaFileCsv className="text-green-600 w-5 h-5" />
          </button>

          <button
            onClick={exportToPdf}
            disabled={isExporting || isLoading}
            title="Exportar PDF"
            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            <FaFilePdf className="text-red-600 w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Pesquisa Dinâmica */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar Lead</label>
        <input
          type="text"
          placeholder="Nome, Telefone, UC, Doc..."
          value={currentFilters.searchTerm || ''}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
        />
      </div>
    </div>
  );
}

export default FilterBar;
