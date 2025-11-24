import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Seu GeoJSON local (se não existir, vamos carregar do link com segurança)
import regioesParana from '../../data/regioes-parana.json'; // ← mantenha se existir

// Corrige ícone padrão
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Limita ao Paraná + evita mundo duplicado
function MapBounds({ leads }) {
  const map = useMap();
  useEffect(() => {
    if (leads.length > 0) {
      const bounds = L.latLngBounds(leads.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([-24.5, -51.5], 7);
    }

    // RESTRIGE SÓ AO PARANÁ (nunca mais mostra o mundo)
    const paranaBounds = L.latLngBounds(
      L.latLng(-26.8, -54.8),
      L.latLng(-22.4, -48.0)
    );
    map.setMaxBounds(paranaBounds);
    map.setMinZoom(7);
    map.setMaxZoom(18);
  }, [leads, map]);
  return null;
}

// Marcador lindo com número dentro
const createCustomMarker = (count) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${count >= 10 ? '#d32f2f' : '#ff6d00'};
        color: white;
        width: 44px;
        height: 44px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 17px;
        border: 4px solid white;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg);">${count}</span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
};

const ParanaMap = ({ leads = [] }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);

  // Carrega o GeoJSON com fallback (nunca mais dá erro)
  useEffect(() => {
    if (regioesParana) {
      setGeoJsonData(regioesParana);
    } else {
      fetch('https://raw.githubusercontent.com/tmotta/parana-regioes-geojson/main/regioes-parana.json')
        .then(r => r.json())
        .then(data => setGeoJsonData(data))
        .catch(() => console.log("GeoJSON não carregou, mas o mapa continua funcionando"));
    }
  }, []);

  // AGRUPA POR CIDADE (a correção que você queria!)
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
    <div style={{
      height: '700px',
      width: '100%',
      maxWidth: '1300px',
      marginLeft: 'auto',
      marginRight: '20px',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      background: '#fff',
      marginTop: '20px'
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

        {/* Só renderiza se tiver dados */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => ({
              fillColor: ['#4CAF50','#2196F3','#FF9800','#F44336','#9C27B0','#00BCD4','#FFEB3B','#795548','#607D8B','#E91E63']
                [(feature.properties.id || feature.properties.regiao_id || 0) % 10],
              fillOpacity: 0.25,
              color: '#333',
              weight: 2,
              opacity: 0.9,
            })}
          />
        )}

        {/* Marcadores com número por cidade */}
        {marcadores.map((item, i) => (
          <Marker
            key={i}
            position={[item.lat, item.lng]}
            icon={createCustomMarker(item.count)}
          >
            <Tooltip permanent direction="top" offset={[0, -44]}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                <div>{item.cidade}</div>
                <div style={{ color: '#1b5e20', fontSize: '13px', marginTop: '4px' }}>
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