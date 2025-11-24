// src/components/reports/ParanaMap.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSpinner } from 'react-icons/fa';

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

export default function ParanaMap({ 
  leadsGanho = [], 
  onRegiaoClick, 
  regiaoAtiva,
  center = { lat: -24.8, lng: -51.5 },   // Centro perfeito do Paraná
  zoom = 7.3                              // Zoom ideal pro estado todo
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(L.layerGroup());
  const regioesGroup = useRef(null);

  // 1. CRIA O MAPA UMA ÚNICA VEZ
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    markersGroup.current.addTo(mapInstance.current);

    // Carrega as mesorregiões do Paraná
    const ibgeUrl = 'https://servicodados.ibge.gov.br/api/v2/malhas/41?formato=application/vnd.geo+json';
    fetch(ibgeUrl)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        regioesGroup.current = L.geoJSON(data, {
          style: (feature) => {
            const nome = feature.properties.NOME || 'Outros';
            const cor = coresRegioes[nome] || coresRegioes['Outros'];
            const opacidade = regiaoAtiva === nome ? 0.85 : 0.45;
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
            layer.bindTooltip(`<strong>${nome}</strong>`, { direction: 'center' });
            layer.on('click', () => {
              mapInstance.current.fitBounds(layer.getBounds());
              onRegiaoClick?.(nome);
            });
          }
        }).addTo(mapInstance.current);
      })
      .catch(() => {});

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []); // roda só uma vez

  // 2. Atualiza estilo das regiões e tooltips
  useEffect(() => {
    if (!mapInstance.current || !regioesGroup.current) return;

    regioesGroup.current.eachLayer(layer => {
      const nome = layer.feature.properties.NOME || 'Outros';
      const cor = coresRegioes[nome] || coresRegioes['Outros'];
      const opacidade = regiaoAtiva === nome ? 0.85 : 0.45;
      layer.setStyle({ fillOpacity: opacidade });

      const count = leadsGanho.filter(l => l.regiao === nome).length;
      layer.setTooltipContent(`<strong>${nome}</strong><br>${count} lead${count !== 1 ? 's' : ''} fechado${count !== 1 ? 's' : ''}`);
    });
  }, [regiaoAtiva, leadsGanho]);

  // 3. Atualiza apenas os marcadores
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
      const tamanho = item.count === 1 ? 34 : item.count < 5 ? 44 : item.count < 10 ? 52 : 62;

      const pin = L.marker([item.lat, item.lng], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: `<div style="background:${cor};width:${tamanho}px;height:${tamanho}px;border-radius:50%;border:4px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;color:white;box-shadow:0 6px 20px rgba(0,0,0,0.3);text-shadow:1px 1px 3px rgba(0,0,0,0.5);">${item.count}</div>`,
          iconSize: [tamanho, tamanho],
          iconAnchor: [tamanho / 2, tamanho / 2]
        })
      });

      const linksHtml = item.links.length > 0
        ? item.links.map((link, i) => `<a href="${link}" target="_blank" class="block text-blue-600 hover:underline text-sm">Lead ${i + 1}</a>`).join('')
        : '<i class="text-gray-500">Sem link</i>';

      pin.bindPopup(`
        <div style="font-family:system-ui;padding:12px;min-width:260px;">
          <b style="font-size:18px">${item.cidade}</b><br>
          <small class="text-gray-600">${item.regiao} • ${item.vendedor}</small><br><br>
          <b style="color:#16a34a;font-size:17px">${item.count} lead${item.count > 1 ? 's' : ''} ganho${item.count > 1 ? 's' : ''}</b><br><br>
          ${linksHtml}
        </div>
      `);

      pin.addTo(markersGroup.current);
    });
  }, [leadsGanho]);

  // RETURN FINAL — BONITO, CENTRALIZADO E RESPONSIVO
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden shadow-2xl border border-gray-300">
        <div 
          ref={mapRef} 
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '520px' }}
        />

        {/* Loading bonito */}
        {leadsGanho.length === 0 && !mapInstance.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/95 z-10 backdrop-blur-sm">
            <div className="text-center">
              <FaSpinner className="animate-spin text-6xl text-indigo-600 mx-auto mb-6" />
              <p className="text-xl text-gray-700 font-medium">Carregando mapa do Paraná...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legenda discreta */}
      <div className="mt-6 text-center text-sm text-gray-600 font-medium">
        Clique em uma região para filtrar • {leadsGanho.length} lead{leadsGanho.length !== 1 ? 's' : ''} fechado{leadsGanho.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}