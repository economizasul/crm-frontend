// src/KanbanBoard.jsx - Versão CORRIGIDA para EXPORTAR STAGES

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaBolt, FaPlus, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// 🚨 CORREÇÃO CRÍTICA: EXPORTANDO STAGES
export const STAGES = [
    { id: 'Para Contatar', title: 'Para Contatar', color: 'bg-blue-500' },
    { id: 'Em Conversação', title: 'Em Conversação', color: 'bg-yellow-500' },
    { id: 'Proposta Enviada', title: 'Proposta Enviada', color: 'bg-green-500' },
    { id: 'Fechado', title: 'Fechado', color: 'bg-gray-500' },
    { id: 'Perdido', title: 'Perdido', color: 'bg-red-500' },
];

// ... (O restante das funções auxiliares como Toast, LeadCard, formatNoteDate) ...

// Função auxiliar para formatar a data da nota
const formatNoteDate = (timestamp) => {
    if (timestamp === 0 || !timestamp) return 'Sem Data';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Data Inválida';
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(date);
    } catch (e) {
        return 'Erro de Formato';
    }
};

// Componente Card de Lead (Versão simplificada)
const LeadCard = ({ lead, onClick }) => {
    // ... (Implementação do LeadCard, conforme seu arquivo) ...
    // Vou omitir o corpo do LeadCard aqui, mas mantenha o seu original.
    // Garanta que ele tenha o onClick para abrir o modal.
    return (
        <div 
            onClick={() => onClick(lead)} // Adicionando onClick para abrir o modal
            className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition duration-150"
        >
            <h3 className="font-bold text-gray-800 truncate">{lead.name}</h3>
            <p className="text-sm text-gray-600">Tel: {lead.phone}</p>
            {lead.avgConsumption && (
                <p className="text-xs text-indigo-500 flex items-center mt-1">
                    <FaBolt size={10} className="mr-1" /> {lead.avgConsumption} kWh
                </p>
            )}
        </div>
    );
};


// Componente Modal (Se estiver no mesmo arquivo)
// **Se você tem um componente LeadModal no KanbanBoard, ele deve ser exportado também.**
// Vou omitir o código do Modal aqui e mantê-lo no LeadSearch.jsx por segurança da compilação.


const KanbanBoard = () => {
    // ... (Estados do Kanban: leads, isLoading, isModalOpen, selectedLead, etc.)
    const [leads, setLeads] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const { token, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // ... (Funções: fetchLeads, openLeadModal, closeLeadModal, handleDragEnd, saveLeadChanges, etc.)

    // ... (O resto da renderização do KanbanBoard, que renderiza as colunas e os cards) ...

    return (
        <div className="p-6 h-full">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Kanban Leads</h1>
            
            {/* ... Renderização do Toast, Botão de Novo Lead, etc. ... */}
            
            {/* Onde o Kanban é renderizado */}
            <div className="flex space-x-4 overflow-x-auto h-full pb-6">
                {STAGES.map(stage => (
                    // ... Lógica de Coluna (Droppable) ...
                    // ... Renderização dos LeadCard (LeadCard lead={lead} onClick={openLeadModal}) ...
                    <div key={stage.id} className="flex-shrink-0 w-80">
                        {/* Conteúdo da Coluna */}
                    </div>
                ))}
            </div>

            {/* Renderização do Modal de Edição (se estiver aqui) */}
            {/* O SEU MODAL ORIGINAL DEVE ESTAR AQUI */}
        </div>
    );
};

export default KanbanBoard;