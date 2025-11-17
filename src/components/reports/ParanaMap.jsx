// src/components/reports/ParanaMap.jsx
import React from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

function ParanaMap({ mapLocations = [], loading = false, mapImageRef = '/images/parana_map_reference.jpg' }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl shadow-md">
        <FaSpinner className="animate-spin text-indigo-500 w-8 h-8" />
        <p className="mt-2 text-indigo-500 text-sm">Carregando dados do mapa...</p>
      </div>
    );
  }

  const totalWonLeads = (mapLocations || []).reduce((s, it) => s + (it.count || 0), 0);
  const totalCities = (mapLocations || []).length;

  // Se a imagem não existir no server, o navegador mostrará 404; aqui mostramos fallback visual
  const imageExistsFallback = (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="font-medium">Imagem do mapa não encontrada</p>
        <p className="text-sm mt-2">Adicione public/images/parana_map_reference.jpg ou configure mapImageRef</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaMapMarkerAlt className="mr-3 text-red-600 w-5 h-5" />
        Distribuição de Clientes Ganho (PR)
      </h3>

      <div className="flex-grow rounded-xl border-2 border-indigo-50 overflow-hidden relative" style={{ minHeight: 400 }}>
        {/* Tenta carregar a imagem; se falhar, usuário verá o fallback abaixo */}
        <img
          src={mapImageRef}
          alt="Mapa do Paraná"
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.style.display = 'none';
            // cria um fallback visual simples
            const parent = e.target.parentNode;
            if (parent) {
              const existing = parent.querySelector('.map-fallback');
              if (!existing) {
                const div = document.createElement('div');
                div.className = 'map-fallback absolute inset-0 flex items-center justify-center bg-white';
                div.innerHTML = `<div class="text-center text-gray-400"><div class="font-medium">Mapa não disponível</div><div class="text-sm mt-1">Coloque /public/images/parana_map_reference.jpg</div></div>`;
                parent.appendChild(div);
              }
            }
          }}
        />

        {/* Marcadores simples usando percentuais (posição simulada) - ideal: migrar para leaflet/mapbox */}
        {mapLocations && mapLocations.slice(0, 200).map((loc, i) => {
          // se lat/lng estiver presente, você pode converter para posição relativa com uma biblioteca de mapas
          // aqui usamos uma posição simulada para protótipo
          const top = `${10 + (i % 6) * 12}%`;
          const left = `${6 + (i % 5) * 18}%`;
          return (
            <div
              key={`${loc.city}-${i}`}
              title={`${loc.city}: ${loc.count.toLocaleString('pt-BR')} clientes Ganho`}
              className="absolute bg-white/90 p-2 rounded-lg shadow-md border border-red-100 text-center"
              style={{ top, left, zIndex: 30 + i, minWidth: 64 }}
            >
              <div className="text-red-600 font-bold text-lg">{loc.count.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-gray-700 mt-1 truncate">{loc.city}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
        <p className="font-semibold">Resumo: <span className="text-red-600 font-bold">{totalWonLeads.toLocaleString('pt-BR')}</span> clientes Ganho em <span className="text-red-600 font-bold">{totalCities}</span> cidades.</p>
      </div>
    </div>
  );
}

export default ParanaMap;
