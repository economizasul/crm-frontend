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
  "Metropolitana de Curitiba": { claro: "#FFA07A", forte: "#FF4500" },
  "Norte Pioneiro": { claro: "#ADD8E6", forte: "#0066CC" },
  "Noroeste": { claro: "#DDA0DD", forte: "#9932CC" },
  "Centro-Ocidental": { claro: "#90EE90", forte: "#006400" },
  "Centro-Sul": { claro: "#FFFFE0", forte: "#FFD700" },
  "Oeste": { claro: "#FFB6C1", forte: "#FF1493" },
  "Sudoeste": { claro: "#87CEEB", forte: "#1E90FF" },
  "Centro Oriental Paranaense": { claro: "#98FB98", forte: "#228B22" },
  "Sudeste Paranaense": { claro: "#D3D3D3", forte: "#696969" },
  "Outros": { claro: "#E0E0E0", forte: "#666666" }
};

export default function ParanaMap({ leadsGanho = [], onRegiaoClick, regiaoAtiva }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(L.layerGroup());
  const regioesGroup = useRef(L.layerGroup());

  // CRIA O MAPA UMA ÚNICA VEZ (nunca mais loop)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([-24.5, -51.5], 7.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Carrega mesorregiões do IBGE
    const ibgeUrl = 'https://servicodados.ibge.gov.br/api/v2/malhas/41?formato=application/vnd.geo+json';
    fetch(ibgeUrl)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        regioesGroup.current = L.geoJSON(data, {
          style: (feature) => {
            const nome = feature.properties.NOME || 'Outros';
            const cor = coresRegioes[nome] || coresRegioes['Outros'];
            const opacidade = regiaoAtiva === nome ? 0.8 : 0.5;
            return {
              fillColor: cor.claro,
              weight: 3,
              opacity: 1,
              color: '#ffffff',
              fillOpacity: opacidade,
            };
          },
          onEachFeature: (feature, layer) => {
            const nome = feature.properties.NOME || 'Desconhecida';
            const count = leadsGanho.filter(l => l.regiao === nome).length;
            layer.bindTooltip(`<strong>${nome}</strong><br>${count} cliente(s)`, {
              permanent: false,
              direction: 'center',
              className: 'tooltip-custom'
            });
            layer.on('click', () => {
              mapInstance.current?.fitBounds(layer.getBounds());
              onRegiaoClick?.(nome);
            });
          }
        }).addTo(mapInstance.current);
      })
      .catch(() => {
        // fallback silencioso
      });

    markersGroup.current.addTo(mapInstance.current);

    // Limpa o mapa ao desmontar
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Atualiza pins
  // Atualiza apenas os pins quando os leads mudam
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    markersGroup.current.clearLayers();

    const agrupados = {};
    leadsGanho.forEach(lead => {
      if (!lead.lat || !lead.lng) return;
      const key = `${parseFloat(lead.lat).toFixed(6)},${parseFloat(lead.lng).toFixed(6)}`;
      if (!agrupados[key]) {
        agrupados[key] = {
          lat: lead.lat,
          lng: lead.lng,
          cidade: lead.cidade || 'Cidade não informada',
          regiao: lead.regiao || 'Outros',
          links: [],
          count: 0,
          vendedor: lead.seller_name || lead.vendedor_name || 'N/A'
        };
      }
      agrupados[key].count += 1;
      if (lead.google_maps_link) agrupados[key].links.push(lead.google_maps_link);
    });

    Object.values(agrupados).forEach(item => {
      const cor = coresRegioes[item.regiao]?.forte || '#10b981';
      const tamanho = item.count === 1 ? 34 : item.count < 5 ? 42 : item.count < 10 ? 50 : 60;

      const pin = L.marker([item.lat, item.lng], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: `<div style="background:${cor};width:${tamanho}px;height:${tamanho}px;border-radius:50%;border:4px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;color:white;box-shadow:0 4px 15px rgba(0,0,0,0.3);">${item.count}</div>`,
          iconSize: [tamanho, tamanho],
          iconAnchor: [tamanho / 2, tamanho / 2]
        })
      });

      const linksHtml = item.links.map((link, i) => 
        `<a href="${link}" target="_blank" class="block text-blue-600 hover:underline text-sm">Cliente ${i + 1}</a>`
      ).join('');

      pin.bindPopup(`
        <div style="font-family:system-ui;padding:8px;min-width:220px;">
          <b style="font-size:16px">${item.cidade}</b><br>
          <small>${item.regiao} • ${item.vendedor}</small><br><br>
          <b style="color:#16a34a">${item.count} cliente${item.count > 1 ? 's' : ''} ganho${item.count > 1 ? 's' : ''}</b><br><br>
          ${linksHtml || '<i>Sem link do Maps</i>'}
        </div>
      `);

      pin.addTo(markersGroup.current);
    });
  }, [leadsGanho, regiaoAtiva]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '600px' }} />
    </div>
  );
}