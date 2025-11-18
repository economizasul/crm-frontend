// src/components/reports/ParanaMap.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import paranaRegioes from '../assets/geojson/parana-regioes.geojson'; // <-- caminho correto

// Corrige ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const coresRegioes = {
  "Norte Pioneiro": { claro: "#ADD8E6", forte: "#0066CC" },
  "Noroeste":       { claro: "#DDA0DD", forte: "#9932CC" },
  "Centro-Ocidental": { claro: "#90EE90", forte: "#006400" },
  "Centro-Sul":     { claro: "#FFFFE0", forte: "#FFD700" },
  "Oeste":          { claro: "#FFB6C1", forte: "#FF1493" },
  "Sudoeste":       { claro: "#87CEEB", forte: "#1E90FF" },
  "Metropolitana de Curitiba": { claro: "#FFA07A", forte: "#FF4500" },
  "Centro Oriental Paranaense": { claro: "#98FB98", forte: "#228B22" },
  "Sudeste Paranaense": { claro: "#D3D3D3", forte: "#696969" },
};

export default function ParanaMap({ leadsGanho = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([-24.5, -51.5], 7.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Camada das regiões
    fetch(paranaRegioes)
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: (feature) => {
            const regiao = feature.properties.NOME_MESO || "Outros";
            const cor = coresRegioes[regiao] || { claro: "#cccccc" };
            return {
              fillColor: cor.claro,
              weight: 2,
              color: "#fff",
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const regiao = feature.properties.NOME_MESO || "Desconhecida";
            const count = leadsGanho.filter(l => l.regiao === regiao).length;
            layer.bindPopup(`<b>${regiao}</b><br>Leads Ganho: ${count}`);
            layer.on('click', () => {
              // Aqui você pode disparar um filtro global no ReportsDashboard
              console.log("Clicou na região:", regiao);
            });
          }
        }).addTo(mapInstance.current);
      });

    // Limpa pins antigos e adiciona novos
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Atualiza pins sempre que leadsGanho mudar
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove pins antigos
    mapInstance.current.eachLayer(layer => {
      if (layer.options && layer.options.icon) layer.remove();
    });

    // Adiciona pins novos
    leadsGanho.forEach(lead => {
      if (!lead.lat || !lead.lng) return;

      const cor = coresRegioes[lead.regiao]?.forte || "#ff7800";

      const pin = L.marker([lead.lat, lead.lng], {
        icon: L.divIcon({
          className: "custom-pin",
          html: `<div style="background:${cor};width:28px;height:28px;border-radius:50%;border:3px solid white;color:white;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.4);">${lead.totalNaCidade || 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
      });

      pin.bindPopup(`
        <div style="min-width:200px">
          <b>${lead.cidade}</b><br>
          Leads Ganho: <b>${lead.totalNaCidade || 1}</b><br><br>
          <a href="${lead.google_maps_link}" target="_blank" style="color:#1a73e8">Abrir no Google Maps</a>
        </div>
      `);

      pin.addTo(mapInstance.current);
    });
  }, [leadsGanho]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "500px" }} />
    </div>
  );
}