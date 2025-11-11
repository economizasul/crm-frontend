// src/components/FilterBar.jsx
import React, { useEffect, useState } from 'react';
import { FaFileCsv, FaFilePdf, FaFilter } from 'react-icons/fa';
import api from '../services/api'; // <--- caminho corrigido (está em src/services/api.js)

/**
 * Componente Barra de Filtros para o Dashboard de Relatórios.
 * Agora busca vendedores reais do banco de dados via API.
 */
function FilterBar({ 
  currentFilters, 
  onFilterChange, 
  onApplyFilters, 
  exportToCsv, 
  exportToPdf, 
  isExporting,
  isLoading 
}) {
  const [vendors, setVendors] = useState([{ id: 'all', name: 'Todos os Vendedores' }]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Buscar vendedores reais do backend
  useEffect(() => {
    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        // ajuste a rota se o seu backend usa outro path (ex: /reports/vendors)
        const res = await api.get('/reports/sellers'); 
        const data = res.data?.data || res.data || [];

        // Se o backend retornar { success: true, data: [...] } ou só [...]
        const vendorList = [{ id: 'all', name: 'Todos os Vendedores' }, ...data];
        setVendors(vendorList);
      } catch (error) {
        console.error('Erro ao buscar vendedores reais:', error);
        // fallback em caso de erro — mantém apenas "Todos"
        setVendors([{ id: 'all', name: 'Todos os Vendedores' }]);
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
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
        
        {/* 1. Filtro de Data Inicial */}
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

        {/* 2. Filtro de Data Final */}
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

        {/* 3. Filtro de Vendedor */}
        <div className="flex-1">
          <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">
            {loadingVendors ? 'Carregando vendedores...' : 'Vendedor'}
          </label>
          <select
            id="vendorId"
            name="vendorId"
            value={currentFilters.vendorId}
            onChange={(e) => onFilterChange({ vendorId: e.target.value })}
            disabled={loadingVendors}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            {vendors.map(vendor => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
        </div>
        
        {/* 4. Filtro de Fonte */}
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

        {/* 5. Botão Aplicar Filtros */}
        <button
          onClick={onApplyFilters}
          disabled={isLoading || isExporting}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 h-[42px]"
        >
          <FaFilter className="mr-2" /> 
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
        </button>
        
        {/* 6. Botões de Exportação */}
        <div className="flex space-x-2">
          <button
            onClick={exportToCsv}
            disabled={isExporting || isLoading}
            title="Exportar para CSV"
            className="flex items-center justify-center p-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            <FaFileCsv className="w-5 h-5 text-green-600" />
            {isExporting && <span className='ml-2 text-xs'>Exportando...</span>}
          </button>
          <button
            onClick={exportToPdf}
            disabled={isExporting || isLoading}
            title="Exportar para PDF"
            className="flex items-center justify-center p-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            <FaFilePdf className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
