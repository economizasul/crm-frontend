import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige ícone padrão
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Limita ao Paraná + zoom mínimo/máximo
function MapBounds({ marcadores }) {
  const map = useMap();
  useEffect(() => {
    const paranaBounds = L.latLngBounds(
      L.latLng(-26.8, -54.8),
      L.latLng(-22.4, -48.0)
    );
    map.setMaxBounds(paranaBounds);
    map.setMinZoom(7);   // ← já tá funcionando (você viu)
    map.setMaxZoom(16);

    if (marcadores.length > 0) {
      const bounds = L.latLngBounds(marcadores.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    } else {
      map.setView([-24.5, -51.5], 7);
    }
  }, [marcadores, map]);
  return null;
}

// MARCADOR LINDO COM NÚMERO DENTRO (igual Google Maps)
const createCustomMarker = (count) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${count >= 5 ? '#d32f2f' : '#ff6d00'};
        color: white;
        width: 48px;
        height: 48px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 19px;
        border: 5px solid white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      ">
        <span style="transform: rotate(45deg);">${count}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

const ParanaMap = ({ leads = [] }) => {
  const [regioesData, setRegioesData] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/tmotta/parana-regioes-geojson/main/regioes-parana.json')
      .then(r => r.json())
      .then(setRegioesData)
      .catch(() => console.log("Regiões não carregaram, mas o mapa funciona"));
  }, []);

// AGRUPA POR CIDADE → 1 marcador por cidade com soma correta
const leadsPorCidade = leads.reduce((acc, lead) => {
  const cidade = (lead.cidade || 'Sem cidade').trim();
  if (!cidade || cidade === 'null') return acc;

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
    // TAMANHO FIXO + À DIREITA (o que você pediu!)
    <div style={{
      height: '680px',
      width: '100%',
      maxWidth: '1080px',
      marginLeft: 'auto',
      marginRight: '40px',
      marginTop: '30px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 15px 50px rgba(0,0,0,0.25)',
      background: '#fff',
      border: '1px solid #ddd'
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

        <MapBounds marcadores={marcadores} />

        {/* 10 REGIÕES DO PARANÁ COLORIDAS */}
        {regioesData && (
          <GeoJSON
            data={regioesData}
            style={(feature) => ({
              fillColor: ['#4CAF50','#2196F3','#FF9800','#F44336','#9C27B0','#00BCD4','#FFEB3B','#795548','#607D8B','#E91E63']
                [(feature.properties.id || 0) % 10],
              fillOpacity: 0.28,
              color: '#444',
              weight: 2.5,
              opacity: 0.9,
            })}
          />
        )}

        {/* MARCADORES COM NÚMERO */}
        {marcadores.map((item, i) => (
          <Marker
            key={i}
            position={[item.lat, item.lng]}
            icon={createCustomMarker(item.count)}
          >
            <Tooltip permanent direction="top" offset={[0, -46]}>
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                <div style={{ fontSize: '16px' }}>{item.cidade}</div>
                <div style={{ color: '#2e7d32', fontSize: '14px' }}>
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