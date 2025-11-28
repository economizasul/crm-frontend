import React, { useEffect, useState, useMemo } from 'react';
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

// ===============================
// LIMITA O MAPA AO ESTADO DO PR
// ===============================
function MapBounds({ marcadores }) {
  const map = useMap();

  useEffect(() => {
    const paranaBounds = L.latLngBounds(
      L.latLng(-26.8, -54.8),
      L.latLng(-22.4, -48.0)
    );

    map.setMaxBounds(paranaBounds);
    map.setMinZoom(7);
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

// ===============================
// PANES PARA RELEVO 3D
// ===============================
function MapPanes() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane('maskPane')) {
      map.createPane('maskPane');
      map.getPane('maskPane').style.zIndex = 400;
      map.getPane('maskPane').style.pointerEvents = 'none';
    }

    if (!map.getPane('reliefPane')) {
      map.createPane('reliefPane');
      map.getPane('reliefPane').style.zIndex = 420;
      map.getPane('reliefPane').style.pointerEvents = 'none';
    }

    if (!map.getPane('paranaTopPane')) {
      map.createPane('paranaTopPane');
      map.getPane('paranaTopPane').style.zIndex = 430;
    }
  }, [map]);

  return null;
}

// ===============================
// MARCADOR PERSONALIZADO
// ===============================
const createCustomMarker = (count) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${count > 1 ? '#d32f2f' : '#ff6d00'};
        color: white;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      ">
        ${count}
      </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

// ===============================
// COMPONENTE PRINCIPAL
// ===============================
const ParanaMap = ({ leads = [] }) => {
  const [regioesData, setRegioesData] = useState(null);
  const [paranaShape, setParanaShape] = useState(null);

  // Carrega contorno do Paraná
  useEffect(() => {
    fetch('/geo/parana-contorno.json')
      .then(r => r.json())
      .then(setParanaShape)
      .catch(err => console.error("Erro ao carregar o contorno do PR:", err));
  }, []);

  // Carrega as regiões intermediárias do PR
  useEffect(() => {
    fetch('/geo/regioes-parana.json')
      .then(r => r.json())
      .then(setRegioesData)
      .catch(err => console.error("Erro ao carregar regiões intermediárias:", err));
  }, []);

  // Agrupa por cidade
  const leadsPorCidade = leads.reduce((acc, lead) => {
    const cidade = (lead.cidade || 'Sem cidade').trim();
    if (!cidade || cidade === 'null') return acc;

    const lat = parseFloat(lead.lat);
    const lng = parseFloat(lead.lng);
    if (isNaN(lat) || isNaN(lng)) return acc;

    if (!acc[cidade]) {
      acc[cidade] = { cidade, lat, lng, count: 0 };
    }
    acc[cidade].count += 1;
    return acc;
  }, {});

  const marcadores = Object.values(leadsPorCidade);

  // Máscara escura global
  const worldMask = useMemo(() => ({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-180, -90],
          [180, -90],
          [180, 90],
          [-180, 90],
          [-180, -90]
        ]]
      }
    }]
  }), []);

  // ===============================
  // RENDERIZAÇÃO
  // ===============================
  return (
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
        <MapPanes />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        <MapBounds marcadores={marcadores} />

        {/* === Máscara escura do mundo === */}
        <GeoJSON
          key="mask"
          pane="maskPane"
          data={worldMask}
          style={{
            fillColor: 'black',
            fillOpacity: 0.45,
            color: 'transparent'
          }}
        />

        {/* === Contorno REAL do Paraná (levemente elevado) === */}
        {paranaShape && (
          <GeoJSON
            data={paranaShape}
            pane="paranaTopPane"
            style={{
              fillColor: '#e0e0e0',
              fillOpacity: 0.35,
              color: '#000',
              weight: 3,
              opacity: 0.9,
            }}
          />
        )}

        {/* === Sombra / Extrusão (efeito 3D) === */}
        {regioesData && (
          <>
            {[6,5,4,3].map((s, i) => (
              <GeoJSON
                key={`shadow-${s}`}
                data={regioesData}
                pane="reliefPane"
                style={{
                  fillOpacity: 0,
                  color: `rgba(0,0,0,${0.07 * (i + 1)})`,
                  weight: s * 3,
                  opacity: 0.9,
                  lineJoin: 'round'
                }}
              />
            ))}

            {/* Camada colorida superior */}
            <GeoJSON
              key="regions-top"
              data={regioesData}
              pane="paranaTopPane"
              style={(feature) => ({
                fillColor: ['#4CAF50','#2196F3','#FF9800','#F44336','#9C27B0','#00BCD4','#FFEB3B','#795548','#607D8B','#E91E63']
                  [(feature.properties.id || 0) % 10],
                fillOpacity: 0.95,
                color: '#ffffff',
                weight: 2.5,
                opacity: 1,
                lineJoin: 'round',
              })}
            />
          </>
        )}

        {/* === Marcadores === */}
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
