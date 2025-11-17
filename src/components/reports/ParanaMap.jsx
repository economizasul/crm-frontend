// src/components/reports/ParanaMap.jsx
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { FaSpinner } from "react-icons/fa";

// Ícone padrão do Leaflet corrigido (Vite precisa disto)
const defaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ParanaMap({ geoData, mapLocations = [], loading = false }) {
  const mapRef = useRef(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl shadow-md">
        <FaSpinner className="animate-spin text-indigo-500 w-8 h-8" />
        <p className="mt-2 text-indigo-500 text-sm">Carregando mapa...</p>
      </div>
    );
  }

  // Totalizadores
  const totalWonLeads = (mapLocations || []).reduce(
    (acc, item) => acc + (item.count || 0),
    0
  );

  const totalCities = mapLocations.length;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        🗺️ Distribuição de Clientes Ganhos (PR)
      </h3>

      <div className="flex-grow rounded-xl border border-gray-200 overflow-hidden">
        <MapContainer
          center={[-24.7, -51.7]} // Centro aproximado do PR
          zoom={6}
          ref={mapRef}
          style={{ width: "100%", height: "500px" }}
        >
          {/* Fundo do mapa */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          />

          {/* GEOJSON DO PARANÁ */}
          {geoData && (
            <GeoJSON
              data={geoData}
              style={() => ({
                color: "#1E40AF",
                weight: 2,
                fillColor: "#93C5FD",
                fillOpacity: 0.3,
              })}
            />
          )}

          {/* MARCADORES DE CIDADES */}
          {mapLocations.map((loc, idx) => (
            <Marker
              key={idx}
              position={[loc.lat, loc.lng]}
              icon={defaultIcon}
            >
              <Popup>
                <strong>{loc.city}</strong>
                <br />
                {loc.count} clientes Ganho
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
        <p className="font-semibold">
          Resumo:{" "}
          <span className="text-indigo-600 font-bold">
            {totalWonLeads.toLocaleString("pt-BR")}
          </span>{" "}
          clientes Ganho em{" "}
          <span className="text-indigo-600 font-bold">
            {totalCities}
          </span>{" "}
          cidades.
        </p>
      </div>
    </div>
  );
}

export default ParanaMap;
