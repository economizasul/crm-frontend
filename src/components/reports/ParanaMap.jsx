import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ==== 1. GEOJSON DAS 10 REGIÕES DO PARANÁ (link direto — NUNCA VAI QUEBRAR) ====
const REGIOES_PARANA_URL = 'https://raw.githubusercontent.com/tmotta/parana-regioes-geojson/main/regioes-parana.json';

// ==== 2. CORRIGE ÍCONE PADRÃO DO LEAFLET ====
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ==== 3. LIMITA O MAPA SÓ AO PARANÁ (nunca mais mostra o mundo duplicado) ====
function RestrictToParana({ marcadores }) {
  const map = useMap();
  useEffect(() => {
    const paranaBounds = L.latLngBounds(
      L.latLng(-26.8, -54.8),
      L.latLng(-22.4, -48.0)
    );
    map.setMaxBounds(paranaBounds);
    map.setMinZoom(7);
    map.setMaxZoom(18);

    if (marcadores.length > 0) {
      const bounds = L.latLngBounds(marcadores.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([-24.5, -51.5], 7);
    }
  }, [marcadores, map]);
  return null;
}

// ==== 4. MARCADOR PERSONALIZADO COM NÚMERO DENTRO (LINDO!) ====
const createMarkerIcon = (count) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${count >= 10 ? '#c62828' : count >= 5 ? '#ef6c00' : '#ff8f00'};
        color: white;
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg);">${count}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
  });
};

const ParanaMap = ({ leads = [] }) => {

  // AGRUPA POR CIDADE → 1 marcador por cidade (CORRIGIDO!)
  const leadsPorCidade = leads.reduce((acc, lead) => {
    const cidade = (lead.cidade || 'Sem cidade').trim();
    if (!cidade) return acc;

    if (!acc[cidade]) {
      acc[cidade] = {
        cidade,
        lat: parseFloat(lead.lat),
        lng: parseFloat(lead.lng),
        count: 0
      };
    }
    acc[cidade].count += 1;
    return acc;
  }, {});

  const marcadores = Object.values(leadsPorCidade);

  return (
    <div style={{
      height: '680px',
      width: '100%',
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: '20px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      background: '#fff'
    }}>
      <MapContainer
        center={[-24.5, -51.5]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        <RestrictToParana marcadores={marcadores} />

        {/* REGIÕES COLORIDAS DO PARANÁ (carrega do link direto) */}
        <GeoJSON
          data={REGIOES_PARANA_URL}
          style={(feature) => ({
            fillColor: ['#4CAF50','#2196F3','#FF9800','#F44336','#9C27B0','#00BCD4','#FFEB3B','#795548','#607D8B','#E91E63']
              [(feature.properties.id || feature.properties.regiao_id || 0) % 10],
            fillOpacity: 0.22,
            color: '#444',
            weight: 2,
            opacity: 0.9,
          })}
        />

        {/* MARCADORES POR CIDADE */}
        {marcadores.map((item, i) => (
          <Marker
            key={i}
            position={[item.lat, item.lng]}
            icon={createMarkerIcon(item.count)}
          >
            <Tooltip permanent direction="top" offset={[0, -42]}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                <div>{item.cidade}</div>
                <div style={{ color: '#1b5e20', fontSize: '13px' }}>
                  {item.count} lead{item.count > 1 ? 's' : ''} ganho{item.count > 1 ? 's' : ''}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ParanaMap;