// src/components/reports/ParanaMap.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

const cidadeParaRegiao = {
  "Curitiba": "Metropolitana de Curitiba",
  "Londrina": "Norte Pioneiro",
  "Maringá": "Noroeste",
  "Ponta Grossa": "Centro Oriental Paranaense",
  "Cascavel": "Oeste",
  "Foz do Iguaçu": "Oeste",
  "Guarapuava": "Centro-Sul",
  "São José dos Pinhais": "Metropolitana de Curitiba",
};

export default function ParanaMap({ leadsGanho = [], onRegiaoClick, regiaoAtiva }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(L.layerGroup());
  const regioesLayer = useRef(L.layerGroup());

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [-24.5, -51.5],
      zoom: 7.5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    fetch('/geo/parana.json')
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: () => ({
            fillColor: "#e5e7eb",
            weight: 1,
            opacity: 1,
            color: "#9ca3af",
            fillOpacity: 0.3,
          }),
        }).addTo(mapInstance.current);
      });

    regioesLayer.current.addTo(mapInstance.current);
    markersGroup.current.addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Atualiza pins
  useEffect(() => {
    if (!mapInstance.current) return;
    markersGroup.current.clearLayers();
    regioesLayer.current.clearLayers();

    const agrupados = {};
    leadsGanho.forEach(lead => {
      if (!lead.lat || !lead.lng) return;
      const key = `${lead.lat.toFixed(6)},${lead.lng.toFixed(6)}`;
      if (!agrupados[key]) {
        const cidadeNorm = (lead.cidade || "").toLowerCase();
        const regiao = Object.keys(cidadeParaRegiao).find(c => cidadeNorm.includes(c.toLowerCase()));
        agrupados[key] = {
          lat: lead.lat,
          lng: lead.lng,
          cidade: lead.cidade || "Cidade não informada",
          regiao: regiao ? cidadeParaRegiao[regiao] : "Outros",
          links: [],
          count: 0
        };
      }
      agrupados[key].count += 1;
      agrupados[key].links.push(lead.google_maps_link);
    });

    Object.values(agrupados).forEach(item => {
      const cor = coresRegioes[item.regiao]?.forte || "#ff7800";
      const tamanho = item.count === 1 ? 34 : item.count < 5 ? 42 : item.count < 10 ? 50 : 58;

      const icon = L.divIcon({
        className: "custom-pin",
        html: `<div style="background:${cor};color:white;width:${tamanho}px;height:${tamanho}px;border-radius:50%;border:4px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:${item.count > 99 ? '14px' : '17px'};box-shadow:0 4px 15px rgba(0,0,0,0.4);">${item.count}</div>`,
        iconSize: [tamanho, tamanho],
        iconAnchor: [tamanho / 2, tamanho / 2],
      });

      const marker = L.marker([item.lat, item.lng], { icon });
      const linksHtml = item.links.map((l, i) => `<a href="${l}" target="_blank" class="block text-blue-600 hover:underline text-sm mt-1">Cliente ${i + 1}</a>`).join('');

      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:230px;">
          <div class="font-bold text-lg">${item.cidade}</div>
          <div class="text-sm text-gray-600">${item.regiao}</div>
          <div class="mt-3 font-semibold text-green-600">${item.count} cliente${item.count > 1 ? 's' : ''} ganho${item.count > 1 ? 's' : ''}</div>
          <div class="mt-3">${linksHtml}</div>
        </div>
      `);

      marker.addTo(markersGroup.current);

      // Cria polígono invisível clicável da região (simulação)
      if (onRegiaoClick && item.regiao) {
        const circle = L.circle([item.lat, item.lng], {
          radius: 50000,
          fillOpacity: 0,
          color: "transparent",
        }).addTo(regioesLayer.current);

        circle.on('click', () => {
          onRegiaoClick(item.regiao);
        });
      }
    });
  }, [leadsGanho, onRegiaoClick]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "600px" }} />
    </div>
  );
}