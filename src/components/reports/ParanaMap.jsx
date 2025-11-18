// src/components/reports/ParanaMap.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arquivo GeoJSON das mesorregiões do Paraná
import paranaRegioes from '../assets/geojson/parana-regioes.geojson';

// Correção de ícones do Leaflet no React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Cores por mesorregião (claro = fundo, forte = pins)
const coresRegioes = {
  "Norte Pioneiro": { claro: "#ADD8E6", forte: "#0066CC" },
  "Noroeste": { claro: "#DDA0DD", forte: "#9932CC" },
  "Centro-Ocidental": { claro: "#90EE90", forte: "#006400" },
  "Centro-Sul": { claro: "#FFFFE0", forte: "#FFD700" },
  "Oeste": { claro: "#FFB6C1", forte: "#FF1493" },
  "Sudoeste": { claro: "#87CEEB", forte: "#1E90FF" },
  "Metropolitana de Curitiba": { claro: "#FFA07A", forte: "#FF4500" },
  "Centro Oriental Paranaense": { claro: "#98FB98", forte: "#228B22" },
  "Sudeste Paranaense": { claro: "#D3D3D3", forte: "#696969" },
  "Outros": { claro: "#E0E0E0", forte: "#666666" }
};

export default function ParanaMap({ leadsGanho = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(L.layerGroup());

  // Inicializa o mapa uma única vez
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [-24.5, -51.5],
      zoom: 7.5,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance.current);

    // Carrega as regiões do Paraná
    fetch(paranaRegioes)
      .then(r => r.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          style: (feature) => {
            const regiao = feature.properties.NOME_MESO || "Outros";
            const cor = coresRegioes[regiao] || coresRegioes["Outros"];
            return {
              fillColor: cor.claro,
              weight: 2.5,
              opacity: 1,
              color: "#ffffff",
              fillOpacity: 0.65,
            };
          },
          onEachFeature: (feature, layer) => {
            const regiao = feature.properties.NOME_MESO || "Desconhecida";
            const count = leadsGanho.filter(l => l.regiao === regiao).length;
            layer.bindTooltip(`<strong>${regiao}</strong><br>${count} cliente${count !== 1 ? 's' : ''} ganho${count !== 1 ? 's' : ''}`, {
              permanent: false,
              direction: 'center'
            });
            layer.bindPopup(`<div class="font-semibold text-lg">${regiao}</div><div class="mt-1">Leads Ganho: <strong>${count}</strong></div>`);
          }
        }).addTo(mapInstance.current);
      });

    markersGroup.current.addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Atualiza pins quando leadsGanho mudar
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    // Limpa pins antigos
    markersGroup.current.clearLayers();

    // Agrupa por coordenadas exatas (mesmo endereço = mesma posição)
    const agrupados = {};
    leadsGanho.forEach(lead => {
      if (!lead.lat || !lead.lng) return;
      const key = `${lead.lat.toFixed(6)},${lead.lng.toFixed(6)}`;
      if (!agrupados[key]) {
        agrupados[key] = {
          lat: lead.lat,
          lng: lead.lng,
          cidade: lead.cidade || "Cidade não informada",
          regiao: lead.regiao || "Outros",
          links: [],
          count: 0
        };
      }
      agrupados[key].count += 1;
      agrupados[key].links.push(lead.google_maps_link);
    });

    // Cria os pins agrupados
    Object.values(agrupados).forEach(item => {
      const cor = coresRegioes[item.regiao]?.forte || "#ff7800";

      const tamanho = item.count === 1 ? 32 : item.count < 5 ? 40 : item.count < 10 ? 48 : 56;

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="
            background: ${cor};
            color: white;
            width: ${tamanho}px;
            height: ${tamanho}px;
            border-radius: 50%;
            border: 4px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${item.count > 99 ? '14px' : '16px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
          ">
            ${item.count}
          </div>
        `,
        iconSize: [tamanho, tamanho],
        iconAnchor: [tamanho / 2, tamanho / 2],
      });

      const marker = L.marker([item.lat, item.lng], { icon });

      const linksHtml = item.links.map(link => 
        `<a href="${link}" target="_blank" class="text-blue-600 hover:underline text-sm">Cliente ${item.links.indexOf(link) + 1}</a>`
      ).join('<br>');

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: system-ui;">
          <div class="font-bold text-lg">${item.cidade}</div>
          <div class="text-sm text-gray-600 mt-1">${item.regiao}</div>
          <div class="mt-3 font-semibold">
            ${item.count} cliente${item.count > 1 ? 's' : ''} ganho${item.count > 1 ? 's' : ''}
          </div>
          <div class="mt-3 space-y-1">
            ${linksHtml}
          </div>
        </div>
      `, { maxWidth: 300 });

      marker.addTo(markersGroup.current);
    });
  }, [leadsGanho]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ minHeight: "580px" }}
      />
    </div>
  );
}