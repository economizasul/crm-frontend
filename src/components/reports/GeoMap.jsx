// src/components/reports/GeoMap.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ============================================================================
// COMPONENTE INTERNO — RENDERIZA OS MARCADORES
// ============================================================================
function MarkersLayer({ locations, calcRadius }) {
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
export default function GeoMap({
  title = "Mapa de Clientes",
  locations = [],
  initialCenter = [-15.78, -47.93],
  initialZoom = 5,
  minRadius = 6,
  maxRadius = 28,
  onExpand = null
}) {
  const calcRadius = (count) => {
    if (!count || count <= 0) return minRadius;
    const r = minRadius + Math.log(count);
    return Math.min(maxRadius, Math.max(minRadius, r));
  };

  const showExpandButton = typeof onExpand === "function";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>

      {/* Título opcional */}
      {title && (
        <h3 style={{ marginBottom: "8px", fontWeight: "600" }}>
          {title}
        </h3>
      )}

      {/* BOTÃO EXPANDIR */}
      {showExpandButton && (
        <button
          onClick={onExpand}
          style={{
            position: "absolute",
            zIndex: 9999,
            top: 10,
            right: 10,
            padding: "6px 12px",
            fontSize: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
          }}
        >
          Expandir
        </button>
      )}

      {/* MAPA */}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{
          width: "100%",
          height: "450px",
          borderRadius: "12px",
          overflow: "hidden"
        }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkersLayer locations={locations} calcRadius={calcRadius} />
      </MapContainer>
    </div>
  );
}
