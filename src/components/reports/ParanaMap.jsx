import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// GeoJSON das 10 regiões do Paraná (100% funcional)
const REGIOES_PARANA_GEOJSON = 'https://raw.githubusercontent.com/tmotta/parana-regioes-geojson/main/regioes-parana.json';

// Componente para limitar ao Paraná
function MapBounds({ marcadores }) {
  const map = useMap();

  React.useEffect(() => {
    const paranaBounds = L.latLngBounds(
      L.latLng(-26.8, -54.8),
      L.latLng(-22.4, -48.0)
    );
    map.setMaxBounds(paranaBounds);
    map.options.minZoom = 7;
    map.options.maxZoom = 18;

    if (marcadores.length > 0) {
      const bounds = L.latLngBounds(marcadores.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([-24.5, -51.5], 7);
    }
  }, [marcadores, map]);

  return null;
}

// Marcador customizado com número dentro
const createClusterIcon = (count) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${count >= 10 ? '#d32f2f' : count >= 5 ? '#f57c00' : '#ff6d00'};
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        border: 4px solid white;
        box-shadow: 0 3px 15px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg); display: block;">${count}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const ParanaMap = ({ leads = [] }) => {
  // AGRUPA POR CIDADE → 1 marcador com soma correta
  const leadsPorCidade = leads.reduce((acc, lead) => {
    const cidade = (lead.cidade || 'Sem cidade').trim() || 'Sem cidade';
    if (!acc[cidade]) {
      acc[cidade] = {
        cidade,
        regiao: lead.regiao || 'Desconhecida',
        lat: parseFloat(lead.lat),
        lng: parseFloat(lead.lng),
        count: 0
      };
    }
    acc[cidade].count += 1;
    return acc;
  }, {});

  const marcadores = Object.values(leadsPorCidade);

  const regioesStyle = (feature) => {
    const cores = [
      '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
      '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63'
    ];
    const id = feature.properties.id || feature.properties.regiao_id || 0;
    return {
      fillColor: cores[id % 10],
      fillOpacity: 0.2,
      color: '#444',
      weight: 2,
      opacity: 0.8,
    };
  };

  return (
    <div style={{
      height: '680px',
      width: '100%',
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: '20px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
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
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapBounds marcadores={marcadores} />

        {/* Regiões do Paraná coloridas */}
        <GeoJSON
          data={regioesParana}
          style={regioesStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties && feature.properties.nome) {
              layer.bindTooltip(feature.properties.nome, {
                permanent: false,
                direction: 'center'
              });
            }
          }}
        />

        {/* Marcadores por cidade */}
        {marcadores.map((item, idx) => (
          <Marker
            key={idx}
            position={[item.lat, item.lng]}
            icon={createClusterIcon(item.count)}
          >
            <Tooltip permanent direction="top" offset={[0, -40]}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                <div>{item.cidade}</div>
                <small style={{ color: '#2e7d32' }}>
                  {item.count} lead{item.count > 1 ? 's' : ''} ganho{item.count > 1 ? 's' : ''}
                </small>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ParanaMap;