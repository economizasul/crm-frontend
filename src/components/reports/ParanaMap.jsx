// src/components/reports/ParanaMap.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arquivo com polígonos reais das mesorregiões do Paraná
import regioesGeoJSON from '../../assets/geojson/parana-mesorregioes.json'; // ← VOCÊ VAI CRIAR ESSE ARQUIVO

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const coresRegioes = {
  "Metropolitana de Curitiba": "#FF4500",
  "Norte Pioneiro": "#0066CC",
  "Noroeste": "#9932CC",
  "Centro-Ocidental": "#006400",
  "Centro-Sul": "#FFD700",
  "Oeste": "#FF1493",
  "Sudoeste": "#1E90FF",
  "Centro Oriental Paranaense": "#228B22",
  "Sudeste Paranaense": "#696969",
};

export default function ParanaMap({ leadsGanho = [], onRegiaoClick, regiaoAtiva }) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const regioesLayer = useRef(null);
  const pinsLayer = useRef(L.layerGroup());

  useEffect(() => {
    if (!mapRef.current || map.current) return;

    map.current = L.map(mapRef.current).setView([-24.7, -51.5], 7.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map.current);

    // Carrega polígonos reais das mesorregiões
    fetch(regioesGeoJSON)
      .then(r => r.json())
      .then(data => {
        regioesLayer.current = L.geoJSON(data, {
          style: (feature) => ({
            fillColor: coresRegioes[feature.properties.nome] || "#cccccc",
            weight: 3,
            color: "#ffffff",
            fillOpacity: regiaoAtiva === feature.properties.nome ? 0.7 : 0.4,
          }),
          onEachFeature: (feature, layer) => {
            const nome = feature.properties.nome;
            layer.bindTooltip(nome, { permanent: false, direction: "center" });
            layer.on('click', () => onRegiaoClick(nome));
          }
        }).addTo(map.current);
      });

    pinsLayer.current.addTo(map.current);

    return () => map.current?.remove();
  }, [onRegiaoClick, regiaoAtiva]);

  // Atualiza pins
  useEffect(() => {
    if (!map.current) return;
    pinsLayer.current.clearLayers();

    const agrupados = {};
    leadsGanho.forEach(l => {
      if (!l.lat || !l.lng) return;
      const key = `${l.lat.toFixed(6)},${l.lng.toFixed(6)}`;
      if (!agrupados[key]) agrupados[key] = { ...l, count: 0, links: [] };
      agrupados[key].count++;
      agrupados[key].links.push(l.google_maps_link);
    });

    Object.values(agrupados).forEach(item => {
      const cor = coresRegioes[item.regiao] || "#ff7800";
      const size = item.count > 20 ? 70 : item.count > 10 ? 60 : item.count > 5 ? 50 : 40;

      const icon = L.divIcon({
        className: "custom-pin",
        html: `<div style="background:${cor};width:${size}px;height:${size}px;border-radius:50%;border:5px solid white;color:white;font-weight:bold;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);">${item.count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
      });

      const marker = L.marker([item.lat, item.lng], { icon });
      const links = item.links.map((l,i) => `<a href="${l}" target="_blank" class="block text-blue-600 hover:underline">Cliente ${i+1}</a>`).join('');
      marker.bindPopup(`<div class="p-2"><strong>${item.cidade}</strong><br>${item.count} cliente(s)<br><div class="mt-2">${links}</div></div>`);
      marker.addTo(pinsLayer.current);
    });
  }, [leadsGanho]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "650px" }} />
    </div>
  );
}