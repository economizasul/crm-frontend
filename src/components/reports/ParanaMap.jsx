// src/components/reports/ParanaMap.jsx
import React, { useEffect, useRef } from 'react';
import { useReports } from '../../hooks/useReports';

const ParanaMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { leads } = useReports();

  useEffect(() => {
    if (!leads || leads.length === 0) return;

    // Força recarregar Google Maps apenas uma vez
    if (mapInstance.current) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -24.8, lng: -51.8 },
        zoom: 7,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });
      mapInstance.current = map;

      // Filtra apenas leads GANHOS com coordenadas válidas
      const wonLeads = leads.filter(lead => 
        lead.status === 'Ganho' && 
        lead.lat && 
        lead.lng && 
        lead.cidade
      );

      if (wonLeads.length === 0) {
        mapRef.current.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xl">Nenhum lead ganho com localização</div>';
        return;
      }

      // Agrupa por cidade
      const cityGroups = {};
      wonLeads.forEach(lead => {
        const city = lead.cidade.trim();
        if (!cityGroups[city]) {
          cityGroups[city] = { count: 0, lat: parseFloat(lead.lat), lng: parseFloat(lead.lng) };
        }
        cityGroups[city].count++;
      });

      // Cria marcadores com número
      Object.entries(cityGroups).forEach(([city, data]) => {
        const marker = new window.google.maps.Marker({
          position: { lat: data.lat, lng: data.lng },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#10b981',
            fillOpacity: 0.95,
            strokeColor: '#059669',
            strokeWeight: 3,
            scale: Math.min(20 + data.count * 4, 60),
            labelOrigin: new window.google.maps.Point(0, 0),
          },
          label: {
            text: data.count.toString(),
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        });

        const info = new window.google.maps.InfoWindow({
          content: `<div style="padding:10px; font-family:system-ui;">
                      <strong style="font-size:15px;">${city}</strong><br>
                      <span style="color:#10b981; font-weight:bold;">${data.count} lead(s) ganho(s)</span>
                    </div>`
        });

        marker.addListener('mouseover', () => info.open(map, marker));
        marker.addListener('mouseout', () => info.close());
      });

      // Ajusta zoom para mostrar todos os marcadores
      const bounds = new window.google.maps.LatLngBounds();
      Object.values(cityGroups).forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }));
      map.fitBounds(bounds);
    };

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [leads]);

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800">
          Mapa do Paraná ({leads?.filter(l => l.status === 'Ganho').length || 0} clientes ganhos)
        </h3>
      </div>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    </div>
  );
};

export default ParanaMap;