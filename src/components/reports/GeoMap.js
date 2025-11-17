// src/components/Reports/GeoMap.jsx
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Ajusta o zoom automaticamente para o GeoJSON carregado
function FitBoundsOnLoad({ geoJsonLayer }) {
  const map = useMap();

  useEffect(() => {
    if (geoJsonLayer?.current) {
      try {
        const bounds = geoJsonLayer.current.getBounds();
        map.fitBounds(bounds, { padding: [30, 30] });
      } catch (e) {
        console.warn("Não foi possível ajustar os bounds:", e);
      }
    }
  }, [geoJsonLayer, map]);

  return null;
}

export default function GeoMap({ geoJsonData, locations }) {
  const geoJsonRef = useRef();

  return (
    <div style={{ width: "100%", height: "500px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        zoom={7}
        center={[-24.5, -51.5]} // centro aproximado do PR
        scrollWheelZoom={true}
      >
        {/* Base map – OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {/* GEOMETRIA DO ESTADO */}
        <GeoJSON
          data={geoJsonData}
          ref={geoJsonRef}
          style={() => ({
            color: "#003366",
            weight: 2,
            fillColor: "#cfe2ff",
            fillOpacity: 0.4
          })}
        />

        {/* Ajusta os bounds assim que carregar */}
        <FitBoundsOnLoad geoJsonLayer={geoJsonRef} />

        {/* MARCADORES - CÍRCULOS POR CIDADE */}
        {locations?.length > 0 &&
          locations.map((loc, idx) =>
            loc.lat && loc.lng ? (
              <CircleMarker
                key={idx}
                center={[loc.lat, loc.lng]}
                radius={6 + Math.min(loc.count, 20)} // tamanho proporcional à quantidade
                pathOptions={{
                  color: "#1e90ff",
                  fillColor: "#1e90ff",
                  fillOpacity: 0.7
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <div style={{ textAlign: "center" }}>
                    <strong>{loc.city}</strong>
                    <br />
                    {loc.count} clientes fechados
                  </div>
                </Tooltip>
              </CircleMarker>
            ) : null
          )}
      </MapContainer>
    </div>
  );
}
