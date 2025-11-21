// src/components/reports/GeoMap.jsx
import React, { useEffect, useRef } from 'react';
import { useReports } from '../../hooks/useReports';

const GeoMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const { leads } = useReports(); // pega todos os leads do hook

  useEffect(() => {
    if (!leads || leads.length === 0 || mapInstance.current) return;

    // Carrega a API do Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -24.5, lng: -51.5 },
        zoom: 7,
        mapTypeId: 'roadmap',
        styles: [
          { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'on' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
      mapInstance.current = map;

      // Filtra apenas leads com status "Ganho" e que tenham lat/lng válidos
      const wonLeads = leads.filter(
        lead => lead.status === 'Ganho' && lead.lat && lead.lng && lead.cidade
      );

      // Agrupa por cidade
      const cityCount = {};
      wonLeads.forEach(lead => {
        const city = lead.cidade.trim();
        cityCount[city] = (cityCount[city] || 0) + 1;
      });

      // Cria um marcador para cada cidade com leads ganhos
      Object.entries(cityCount).forEach(([city, count]) => {
        const leadInCity = wonLeads.find(l => l.cidade.trim() === city);
        if (!leadInCity) return;

        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(leadInCity.lat), lng: parseFloat(leadInCity.lng) },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#22c55e',        // verde sucesso
            fillOpacity: 0.9,
            strokeColor: '#16a34a',
            strokeWeight: 2,
            scale: 18 + count * 3,       // tamanho aumenta com quantidade
            labelOrigin: new window.google.maps.Point(0, 0),
          },
          label: {
            text: count.toString(),
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        });

        // Tooltip ao passar o mouse
        const infowindow = new window.google.maps.InfoWindow({
          content: `<div style="padding:8px; font-weight:bold; color:#1f2937;">
                      <div>${city}</div>
                      <div style="color:#22c55e; font-size:1.1em;">${count} lead(s) ganho(s)</div>
                    </div>`,
        });

        marker.addListener('mouseover', () => infowindow.open(map, marker));
        marker.addListener('mouseout', () => infowindow.close());
      });
    };

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [leads]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      {!leads || leads.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <p className="text-gray-500 text-lg">Carregando mapa de leads ganhos...</p>
        </div>
      )}
    </div>
  );
};

export default GeoMap;