// src/components/FilterBar.jsx
import React, { useEffect, useState } from 'react';
import { FaFileCsv, FaFilePdf, FaFilter } from 'react-icons/fa';
import api from '../services/api'; // ✅ seu cliente Axios configurado (verifique o caminho)

function FilterBar({ 
  currentFilters, 
  onFilterChange, 
  onApplyFilters, 
  exportToCsv, 
  exportToPdf, 
  isExporting,
  isLoading 
}) {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Busca vendedores reais no backend
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        setError(null);
        const res = await api.get('/reports/sellers'); // 🔥 Rota correta
        if (res.data.success && Array.isArray(res.data.data)) {
          const vendorList = [
            { id: 'all', name: 'Todos os Vendedores' },
            ...res.data.data.map(v => ({ id: v.id, name: v.name }))
          ];
          setVendors(vendorList);
        } else {
          throw new Error('Formato inesperado de resposta da API.');
        }
      } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
        setError('Falha ao carregar vendedores');
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
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

        {/* 1. Data Inicial */}
        <div className="flex-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">De (Data Inicial)</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={currentFilters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        {/* 2. Data Final */}
        <div className="flex-1">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Até (Data Final)</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={currentFilters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        {/* 3. Vendedor */}
        <div className="flex-1">
          <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">Vendedor</label>
          <select
            id="vendorId"
            name="vendorId"
            value={currentFilters.vendorId}
            onChange={(e) => onFilterChange({ vendorId: e.target.value })}
            disabled={loadingVendors}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            {loadingVendors && <option>Carregando vendedores...</option>}
            {!loadingVendors && vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* 4. Fonte */}
        <div className="flex-1">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">Fonte</label>
          <select
            id="source"
            name="source"
            value={currentFilters.source}
            onChange={(e) => onFilterChange({ source: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            {sources.map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>

        {/* 5. Botão Aplicar */}
        <button
          onClick={onApplyFilters}
          disabled={isLoading || isExporting}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 h-[42px]"
        >
          <FaFilter className="mr-2" />
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
        </button>

        {/* 6. Exportações */}
        <div className="flex space-x-2">
          <button
            onClick={exportToCsv}
            disabled={isExporting || isLoading}
            title="Exportar CSV"
            className="flex items-center justify-center p-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaFileCsv className="w-5 h-5 text-green-600" />
          </button>
          <button
            onClick={exportToPdf}
            disabled={isExporting || isLoading}
            title="Exportar PDF"
            className="flex items-center justify-center p-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaFilePdf className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
