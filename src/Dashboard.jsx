import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; // Importa o hook de autenticação

const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [showMap, setShowMap] = useState(false); // Estado para controlar a exibição do mapa
    const position = [-23.5505, -46.6333];
    const { user, token } = useAuth(); // Obtém o token do contexto de autenticação

    useEffect(() => {
        console.log('Debug Token:', token); // Log para debugar o token
        const fetchLeads = async () => {
            if (!token) {
                console.error('Token não encontrado. Faça login novamente.');
                return;
            }
            try {
                const response = await axios.get('https://crm-app-cnf7.onrender.com/api/v1/leads', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Adiciona o token para autenticação
                    },
                });
                console.log('Resposta da API:', response.data); // Log para debugar a resposta
                setLeads(response.data);
            } catch (error) {
                console.error('Erro ao carregar leads:', error.response?.data || error.message);
            }
        };
        fetchLeads();
    }, [token]); // Adiciona token como dependência para recarregar se o token mudar

    // Função para organizar leads por status fixo
    const getLeadsByStatus = () => {
        const statusMap = {
            'Para Contatar': [],
            'Em Andamento': [],
            'Concluído': [],
        };
        leads.forEach(lead => {
            if (statusMap[lead.status]) statusMap[lead.status].push(lead);
        });
        return statusMap;
    };

    const leadsByStatus = getLeadsByStatus();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Kanban Leads</h1>
            {leads.length === 0 ? (
                <p>Carregando leads... ou nenhum lead encontrado. Verifique o console para erros.</p>
            ) : (
                <div>
                    <div className="flex space-x-4 overflow-x-auto">
                        {Object.keys(leadsByStatus).map(status => (
                            <div key={status} className="min-w-[250px] bg-gray-100 p-4 rounded">
                                <h2 className="text-lg font-semibold mb-2">{status}</h2>
                                <ul>
                                    {leadsByStatus[status].map(lead => (
                                        <li key={lead._id || lead.id} className="mb-2 p-2 bg-white rounded shadow">
                                            <strong>{lead.name}</strong> - {lead.address || 'Sem endereço'}
                                            <p>Status: {lead.status}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
                        </button>
                        {showMap && leads.some(lead => lead.lat && lead.lng) && (
                            <div className="mt-4">
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
                            </div>
                        )}
                        {showMap && !leads.some(lead => lead.lat && lead.lng) && (
                            <p className="mt-2 text-red-500">Nenhum lead com coordenadas disponíveis.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;