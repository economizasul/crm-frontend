import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Ícone personalizado
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const position = [-23.5505, -46.6333]; // Centro em SP

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await axios.get('https://<backend-url>/api/v1/leads');
                setLeads(response.data);
            } catch (error) {
                console.error('Erro ao carregar leads:', error);
            }
        };
        fetchLeads();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {leads.length === 0 ? (
                <p>Carregando leads... ou nenhum lead encontrado.</p>
            ) : (
                <MapContainer center={position} zoom={10} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {leads.map(lead => lead.lat && lead.lng && (
                        <Marker key={lead._id || lead.id} position={[lead.lat, lead.lng]} icon={customIcon}>
                            <Popup>
                                <strong>{lead.name}</strong><br />
                                {lead.address}<br />
                                Status: {lead.status}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
};

export default Dashboard;