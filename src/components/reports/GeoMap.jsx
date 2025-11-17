// src/components/reports/GeoMap.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ============================================================================
// COMPONENTE SEPARADO — NECESSÁRIO PARA USO CORRETO DE HOOKS
// ============================================================================
function MarkersAndClusters({ locations, clusterAvailable, calcRadius }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let clusterGroup = null;

    return () => {
      if (clusterGroup) {
        try {
          map.removeLayer(clusterGroup);
        } catch (e) {}
        clusterGroup = null;
      }
    };
  }, [map]);

  if (clusterAvailable) return null;

  return (
    <>
      {locations?.map((loc, i) =>
        loc.lat && loc.lng ? (
          <CircleMarker
            key={`cm-${loc.city}-${i}`}
            center={[Number(loc.lat), Number(loc.lng)]}
            radius={calcRadius(loc.count)}
            pathOptions={{
              color: "#1e90ff",
              fillColor: "#1e90ff",
              fillOpacity: 0.75,
              weight: 1
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div style={{ textAlign: "center" }}>
                <strong>{loc.city}</strong>
                <br />
                {loc.count.toLocaleString("pt-BR")} clientes fechados
              </div>
            </Tooltip>
          </CircleMarker>
        ) : null
      )}
    </>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function GeoMap({ title = "Mapa de Clientes", locations = [], clusterAvailable = false }) {
  const center = [-15.78, -47.93];

  const calcRadius = (count) => {
    if (!count || count <= 0) return 4;
    return Math.min(40, Math.max(6, 4 + Math.log(count)));
  };

  if (!locations || locations.length === 0) {
    return (
      <div className="map-wrapper">
        <h3>{title}</h3>
        <p>Nenhuma localização encontrada.</p>
      </div>
    );
  }

  return (
    <div className="map-wrapper" style={{ width: "100%", height: "100%" }}>
      <h3 style={{ marginBottom: "10px" }}>{title}</h3>

      <MapContainer
        center={center}
        zoom={5}
        style={{ width: "100%", height: "450px", borderRadius: "12px", overflow: "hidden" }}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkersAndClusters
          locations={locations}
          clusterAvailable={clusterAvailable}
          calcRadius={calcRadius}
        />
      </MapContainer>
    </div>
  );
}
