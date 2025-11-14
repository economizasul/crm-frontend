// src/components/reports/ParanaMap.jsx
import React from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

/**
 * Componente que exibe a distribuição de clientes "Ganho" no Paraná.
 * @param {Array<Object>} mapLocations - Array de { city, count, lat, lng } de leads 'Ganho'.
 * @param {boolean} loading - Estado de carregamento.
 * @param {string} mapImageRef - URL da imagem do mapa regionalizado do Paraná.
 */
function ParanaMap({ mapLocations, loading, mapImageRef = 'https://via.placeholder.com/800x600?text=Mapa+do+Paran%C3%A1+Regionalizado' }) {
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition duration-500">
                <FaSpinner className="animate-spin text-indigo-500 w-8 h-8" />
                <p className="mt-2 text-indigo-500 text-sm">Carregando dados geográficos do Paraná...</p>
            </div>
        );
    }
    
    // Calcula o total de leads 'Ganho' para o resumo
    const totalWonLeads = mapLocations?.reduce((sum, item) => sum + item.count, 0) || 0;
    const totalCities = mapLocations?.length || 0;
    
    // Na sua implementação real, o mapImageRef deve ser a URL da imagem (image_a54727.jpg)
    // ou o componente do mapa real com as cores regionais que você desejar.
    
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition duration-500 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-red-600 w-5 h-5" /> 
                Distribuição de Clientes Ganho (PR)
            </h3>
            
            {/* Visual do Mapa - Ultra Moderno */}
            <div 
                className="flex-grow bg-cover bg-center rounded-xl border-4 border-indigo-100 dark:border-indigo-900 relative overflow-hidden"
                style={{ 
                    // Simulação do mapa do Paraná com as regiões coloridas
                    backgroundImage: `url(${mapImageRef})`, 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '400px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', // Elevação moderna
                }}
            >
                {/* Marcadores de Cidade - Simulação Ultra Moderna */}
                {/* Na implementação real, as coordenadas lat/lng do 'mapLocations' seriam usadas aqui */}
                {mapLocations && mapLocations.slice(0, 5).map((loc, index) => (
                    <div 
                        key={loc.city}
                        // Posições simuladas. Use a biblioteca de mapas para posicionar corretamente.
                        className="absolute flex flex-col items-center p-2 bg-white rounded-lg shadow-2xl border-2 border-red-500 text-gray-900 transform hover:scale-105 transition duration-300 cursor-help"
                        style={{ 
                            top: `${10 + index * 10}%`, 
                            left: `${10 + index * 15}%`, 
                            minWidth: '60px', 
                            zIndex: 10 + index,
                            // Destaque o número e o nome da cidade
                        }}
                        title={`${loc.city}: ${loc.count.toLocaleString('pt-BR')} Clientes Ganho`}
                    >
                        <span className="font-extrabold text-lg text-red-600 leading-none">{loc.count.toLocaleString('pt-BR')}</span>
                        <span className="text-xs font-medium text-gray-600 leading-none mt-1">{loc.city.split(' ')[0]}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold">Resumo: <span className="text-red-600 font-bold">{totalWonLeads.toLocaleString('pt-BR')}</span> Clientes Ganho mapeados em <span className="text-red-600 font-bold">{totalCities}</span> cidades.</p>
            </div>
        </div>
    );
}

export default ParanaMap;