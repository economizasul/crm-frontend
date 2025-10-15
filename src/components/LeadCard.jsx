import React from 'react';
import { MapPin, Users } from 'lucide-react'; 

// Componente para exibir o Status com estilo de badge
// É melhor manter esta função aqui, pois ela é específica do Card.
const StatusBadge = ({ status }) => {
    let classes = "text-xs font-semibold px-2.5 py-0.5 rounded-full";
    if (status === 'Fechado') classes += " bg-green-100 text-green-800";
    else if (status === 'Em Negociação') classes += " bg-yellow-100 text-yellow-800";
    else if (status === 'Para Contatar') classes += " bg-red-100 text-red-800";
    else classes += " bg-gray-100 text-gray-800";
    
    return <span className={classes}>{status}</span>;
};

const LeadCard = ({ lead, onClick }) => {
    // Desestrutura o objeto lead para fácil acesso
    const { id, name, status, uc, address, origin } = lead;

    return (
        <div 
            key={id} 
            // Classes de Card moderno
            className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-indigo-300 transform transition duration-300 cursor-pointer"
            onClick={() => onClick(id)} // Executa a navegação passada como prop
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{name}</h3>
                <StatusBadge status={status} />
            </div>
            <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center">
                    <Users size={14} className="inline mr-2 text-indigo-500" /> 
                    <span className="font-medium">UC:</span> {uc || 'Não informada'}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                    <MapPin size={14} className="inline mr-2 text-indigo-500" /> 
                    <span className="font-medium">Endereço:</span> {address || 'Pendente'}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                    <span className="font-medium bg-gray-100 px-1 rounded text-xs">
                        {origin || 'Website'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LeadCard;