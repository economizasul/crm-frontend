// src/components/FilterBar.jsx

import React from 'react';
import { FaFileCsv, FaFilePdf, FaSearch, FaRedo } from 'react-icons/fa';

/**
 * Barra de Filtros para a página de Relatórios.
 * Gerencia a entrada de filtros e os botões de ação (Buscar e Exportar).
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
    // Exemplo de manipulação de data (assumindo inputs text/date)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };
    
    // Função para renderizar o ícone de carregamento/exportação
    const RenderIcon = ({ onClick, icon: Icon, label, disabled, color, isExport }) => (
        <button
            onClick={onClick}
            disabled={disabled || isExporting}
            className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg 
                font-semibold transition duration-200 
                ${isExporting && isExport ? 'bg-gray-400 cursor-not-allowed' : 
                  disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                  `bg-${color}-500 hover:bg-${color}-600 text-white shadow-md`}
            `}
        >
            {isExporting && isExport ? (
                <>
                    <FaRedo className="animate-spin" />
                    <span>Exportando...</span>
                </>
            ) : (
                <>
                    <Icon />
                    <span>{label}</span>
                </>
            )}
        </button>
    );

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
            {/* Seção de Filtros */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro de Data Inicial */}
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">De</label>
                    <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        value={currentFilters.startDate || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                
                {/* Filtro de Data Final */}
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Até</label>
                    <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        value={currentFilters.endDate || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                
                {/* Filtro de Vendedor (Exemplo) */}
                <div>
                    <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">Vendedor</label>
                    <select
                        name="vendorId"
                        id="vendorId"
                        value={currentFilters.vendorId || 'all'}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="all">Todos</option>
                        {/* ⚠️ ADICIONAR OPTIONS DE VENDEDORES REAIS AQUI */}
                        <option value="1">Vendedor A</option>
                        <option value="2">Vendedor B</option>
                    </select>
                </div>

                {/* Filtro de Fonte (Exemplo) */}
                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700">Fonte</label>
                    <select
                        name="source"
                        id="source"
                        value={currentFilters.source || 'all'}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="all">Todas</option>
                        {/* ⚠️ ADICIONAR OPTIONS DE FONTES REAIS AQUI */}
                        <option value="Site">Site</option>
                        <option value="Telefone">Telefone</option>
                    </select>
                </div>

            </div>
            
            {/* Seção de Ações (Buscar e Exportar) */}
            <div className="flex space-x-2 justify-end">
                {/* Botão de Buscar/Aplicar Filtros */}
                <RenderIcon 
                    onClick={onApplyFilters}
                    icon={FaSearch}
                    label={isLoading ? 'Buscando...' : 'Buscar'}
                    disabled={isLoading || isExporting}
                    color="indigo"
                    isExport={false}
                />
                
                {/* Botão de Exportar CSV */}
                <RenderIcon 
                    onClick={exportToCsv}
                    icon={FaFileCsv}
                    label="Exportar CSV"
                    disabled={isLoading || isExporting}
                    color="green"
                    isExport={true}
                />
                
                {/* Botão de Exportar PDF */}
                <RenderIcon 
                    onClick={exportToPdf}
                    icon={FaFilePdf}
                    label="Exportar PDF"
                    disabled={isLoading || isExporting}
                    color="red"
                    isExport={true}
                />
            </div>
        </div>
    );
}

export default FilterBar;