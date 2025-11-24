import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SEU GEOJSON LOCAL (que já funcionava antes)
import regioesParana from '../../data/regioes-parana.json';

// Corrige o ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Limita o mapa ao Paraná e evita zoom infinito
function MapBounds({ leads }) {
  const map = useMap();
  React.useEffect(() => {
    const bounds = L.latLngBounds(
      L.latLng(-26.8, -54.8),
      L.latLng(-22.4, -48.0)
    );
    map.setMaxBounds(bounds);
    map.setMinZoom(7);
    map.setMaxZoom(18);

    if (leads.length > 0) {
      const group = L.latLngBounds(leads.map(l => [l.lat, l.lng]));
      map.fitBounds(group, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([-24.5, -51.5], 7);
    }
  }, [leads, map]);
  return null;
}

// Marcador com número dentro (o que você já tinha)
const createCustomMarker = (count) => {
  return L.divIcon({
    html: `<div style="
      background: ${count > 5 ? '#d32f2f' : '#ff6d00'};
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
    "><span style="transform: rotate(45deg);">${count}</span></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const ParanaMap = ({ leads = [] }) => {
  // AGRUPAMENTO CORRIGIDO: 1 marcador por cidade (não por coordenada)
  const leadsPorCidade = leads.reduce((acc, lead) => {
    const cidade = (lead.cidade || 'Sem cidade').trim();
    if (!cidade) return acc;

    if (!acc[cidade]) {
      acc[cidade] = {
        cidade,
        lat: parseFloat(lead.lat),
        lng: parseFloat(lead.lng),
        count: 0,
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
          attribution='&copy; OpenStreetMap'
        />

        <MapBounds leads={marcadores} />

        {/* Regiões coloridas — seu arquivo local que já funcionava */}
        <GeoJSON
          data={regioesParana}
          style={(feature) => ({
            fillColor: ['#4CAF50','#2196F3','#FF9800','#F44336','#9C27B0','#00BCD4','#FFEB3B','#795548','#607D8B','#E91E63']
              [(feature.properties.id || feature.properties.regiao_id || 0) % 10],
            fillOpacity: 0.25,
            color: '#333',
            weight: 1.5,
            opacity: 0.8,
          })}
        />

        {/* Marcadores agrupados por cidade */}
        {marcadores.map((item, i) => (
          <Marker
            key={i}
            position={[item.lat, item.lng]}
            icon={createCustomMarker(item.count)}
          >
            <Tooltip permanent direction="top" offset={[0, -40]}>
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                {item.cidade}<br />
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