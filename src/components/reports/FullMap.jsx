// src/components/reports/FullMap.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GeoMap from './GeoMap'; // same folder
import { FaTimes } from 'react-icons/fa';
import '../styles/fullmap.css'; // optional: create to tweak full-screen styles if you want

/**
 * FullMap - página que exibe somente o mapa em tela cheia.
 * Espera receber por location.state a propriedade locations (array) opcional.
 * Se não receber, o componente GeoMap buscará pontos via props (locations prop) - aqui passaremos locations from state.
 */
export default function FullMap() {
  const navigate = useNavigate();
  const location = useLocation();

  // allow passing locations from the dashboard via navigate('/full-map', { state: { locations } })
  const locations = location.state?.locations || [];

  return (
    <div className="min-h-screen w-full bg-[#f7fafc] flex flex-col">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">Mapa - Paraná (tela cheia)</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-white hover:shadow-sm"
            title="Fechar"
          >
            <FaTimes /> Fechar
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="rounded-2xl shadow-md h-[calc(100vh-96px)] bg-white overflow-hidden">
          <GeoMap
            locations={locations}
            initialCenter={[-24.5, -51.5]}
            initialZoom={7}
            minRadius={8}
            maxRadius={40}
            showExpandButton={false} />
        </div>
      </main>
    </div>
  );
}
