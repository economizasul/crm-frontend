// src/components/reports/GeoMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * GeoMap
 * - Busca geojson em /geo/parana.json (public/geo/parana.json)
 * - Recebe `locations` = [{ city, count, lat, lng }, ...]
 * - Tenta usar leaflet.markercluster dinamicamente (se instalado). Se não, usa CircleMarker simples.
 * - Exibe bolinhas proporcionais, tooltip e ajusta bounds automaticamente.
 *
 * Props:
 * - locations: array de pontos do backend
 * - initialCenter: [lat, lng]
 * - initialZoom: number
 * - minRadius / maxRadius: sizing
 */
export default function GeoMap({
  locations = [],
  initialCenter = [-24.5, -51.5],
  initialZoom = 7,
  minRadius = 6,
  maxRadius = 28,
  mapStyle = {},
  showExpandButton = true,
  onExpand = null // função opcional chamada quando usuário clicar "Expandir"
}) {
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [clusterAvailable, setClusterAvailable] = useState(false);

  // fetch geojson (from public/geo/parana.json)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/geo/parana.json");
        if (!res.ok) throw new Error("GeoJSON não encontrado");
        const json = await res.json();
        if (mounted) setGeoJsonData(json);
      } catch (err) {
        console.warn("GeoMap: falha ao carregar /geo/parana.json:", err.message);
        if (mounted) setGeoJsonData(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // tenta importar leaflet.markercluster dinamicamente
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // somente tenta se L existir
        if (!L) return;
        // dynamic import pode falhar se não instalado -> catch
        await import("leaflet.markercluster");
        if (mounted && L && typeof L.markerClusterGroup === "function") {
          setClusterAvailable(true);
        }
      } catch (err) {
        // não é crítico: apenas desliga clustering se não estiver disponível
        if (mounted) setClusterAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Ajusta bounds para o estado (geojson) + pontos
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const leafletMap = map;
    // Collect bounds from geojson and points
    try {
      const boundsParts = [];

      if (geoJsonRef.current && geoJsonData) {
        try {
          const gjLayer = geoJsonRef.current;
          const gjBounds = gjLayer.getBounds();
          if (gjBounds && gjBounds.isValid && gjBounds.isValid()) boundsParts.push(gjBounds);
        } catch (e) {
          // ignore
        }
      }

      // build LatLngBounds from markers
      const pointLatLngs = locations
        .filter(p => p && p.lat && p.lng)
        .map(p => L.latLng(Number(p.lat), Number(p.lng)));

      if (pointLatLngs.length) {
        const ptsBounds = L.latLngBounds(pointLatLngs);
        boundsParts.push(ptsBounds);
      }

      if (boundsParts.length) {
        // merge
        let merged = boundsParts[0];
        for (let i = 1; i < boundsParts.length; i++) {
          merged = merged.extend(boundsParts[i]);
        }
        if (merged.isValid && merged.isValid()) {
          leafletMap.fitBounds(merged, { padding: [40, 40] });
        }
      } else {
        // fallback: set view to initial center/zoom
        leafletMap.setView(initialCenter, initialZoom);
      }
    } catch (err) {
      // fallback silent
      leafletMap.setView(initialCenter, initialZoom);
    }
  }, [geoJsonData, locations, initialCenter, initialZoom]);

  // util: calcula radius proporcional
  const calcRadius = (count) => {
    const c = Number(count || 0);
    if (c <= 0) return minRadius;
    // map count to range [minRadius, maxRadius] using sqrt scaling
    const scaled = Math.sqrt(c);
    // better mapping: find max count
    const maxCount = Math.max(1, ...locations.map(x => x.count || 0));
    const factor = Math.sqrt(maxCount);
    const ratio = Math.min(1, scaled / (factor || 1));
    return Math.round(minRadius + ratio * (maxRadius - minRadius));
  };

  // Render markers either via cluster plugin (if available) or as CircleMarker inside React tree.
  // We will render CircleMarker list (react-leaflet) — and if clustering lib is available we additionally create cluster layer.
  // Simpler approach: if clusterAvailable we will create markers via L.marker and cluster group imperatively.
  function MarkersAndClusters() {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      let clusterGroup = null;
      // cleanup function
      return () => {
        if (clusterGroup) {
          try { map.removeLayer(clusterGroup); } catch (e) {}
          clusterGroup = null;
        }
      };
    }, [map]);

    // If clustering available, we'll render nothing here (we'll add cluster imperatively below).
    return (
      <>
        {!clusterAvailable && locations && locations.length > 0 && locations.map((loc, i) => (
          loc.lat && loc.lng ? (
            <CircleMarker
              key={`cm-${loc.city}-${i}`}
              center={[Number(loc.lat), Number(loc.lng)]}
              radius={calcRadius(loc.count)}
              pathOptions={{ color: "#1e90ff", fillColor: "#1e90ff", fillOpacity: 0.75, weight: 1 }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <div style={{ textAlign: "center" }}>
                  <strong>{loc.city}</strong><br />
                  {loc.count.toLocaleString ? loc.count.toLocaleString('pt-BR') : loc.count} clientes fechados
                </div>
              </Tooltip>
            </CircleMarker>
          ) : null
        ))}
      </>
    );
  }

  // If clusterAvailable we add cluster group imperatively (so it's compatible even if react-leaflet markercluster wrappers not installed)
  useEffect(() => {
    if (!clusterAvailable) return;
    if (!mapRef.current) return;
    if (!window.L || typeof window.L.markerClusterGroup !== "function") return;

    const map = mapRef.current;
    const clusterGroup = window.L.markerClusterGroup ? window.L.markerClusterGroup() : null;
    if (!clusterGroup) return;

    // create markers and add to cluster
    locations.forEach((loc, i) => {
      if (!loc || !loc.lat || !loc.lng) return;
      const marker = window.L.circleMarker([Number(loc.lat), Number(loc.lng)], {
        radius: calcRadius(loc.count),
        color: "#1e90ff",
        fillColor: "#1e90ff",
        fillOpacity: 0.8,
        weight: 1
      });
      const html = `<div style="text-align:center;font-weight:600">${loc.city}<br/>${(loc.count||0).toLocaleString('pt-BR')} clientes</div>`;
      marker.bindTooltip(html, { direction: 'top', offset: [0, -6], opacity: 1 });
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      try { map.removeLayer(clusterGroup); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterAvailable, locations]);

  // main render
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 420, position: "relative", ...mapStyle }}>
      {/* Expand button (top-right) */}
      {showExpandButton && (
        <div style={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 999,
          display: "flex",
          gap: 8
        }}>
          <button
            onClick={() => { if (typeof onExpand === "function") onExpand(); else window.location.href = "/full-map"; }}
            className="text-sm font-medium px-3 py-1 rounded-md border border-gray-200 bg-white shadow-sm hover:shadow-md"
            style={{ backdropFilter: "blur(4px)" }}
            title="Expandir mapa"
          >
            Expandir
          </button>
        </div>
      )}

      <MapContainer
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {geoJsonData ? (
          <GeoJSON
            data={geoJsonData}
            ref={geoJsonRef}
            style={() => ({
              color: "#003366",
              weight: 1.5,
              fillColor: "#dbeafe",
              fillOpacity: 0.45
            })}
          />
        ) : null}

        <MarkersAndClusters />
      </MapContainer>
    </div>
  );
}
