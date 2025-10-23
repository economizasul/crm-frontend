import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa'; // Ajustado os ícones importados
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import LeadEditModal from './components/LeadEditModal'; // <--- AGORA IMPORTA O COMPONENTE EXTERNO

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estrutura de STAGES 
export const STAGES = [
    { id: 'Para Contatar', title: 'Para Contatar', color: 'bg-red-500' },
    { id: 'Em Contato', title: 'Em Contato', color: 'bg-yellow-500' },
    { id: 'Proposta Enviada', title: 'Proposta Enviada', color: 'bg-blue-500' },
    { id: 'Fechado', title: 'Fechado', color: 'bg-green-500' },
    { id: 'Perdido', title: 'Perdido', color: 'bg-gray-500' },
];

// Componente simples de Toast para feedback
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    return (
        <div className={`p-3 rounded-lg text-white font-medium shadow-lg fixed top-4 right-4 z-50 ${bgColor}`}>
            {message}
        </div>
    );
};

// Componente Card de Lead
const LeadCard = ({ lead, onClick, onDragStart }) => {
    const statusStage = STAGES.find(s => s.id === lead.status);

    const lastNote = Array.isArray(lead.notes) && lead.notes.length > 0 
        ? lead.notes[lead.notes.length - 1] 
        : 'Nenhuma nota.';
    
    // Garante que a nota é tratada corretamente, seja string ou objeto
    const lastNoteText = typeof lastNote === 'string' ? lastNote : (lastNote.text || 'Nenhuma nota.');

    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, lead._id)}
            onClick={() => onClick(lead)}
            className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition duration-150"
        >
            <h4 className="font-semibold text-indigo-700 truncate">{lead.name}</h4>
            <p className="text-sm text-gray-600">{lead.phone}</p>
            <p className="text-xs text-gray-500 truncate">UC: {lead.uc || 'N/A'}</p>
            <div className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full text-white inline-block ${statusStage?.color || 'bg-gray-400'}`}>
                {lead.status}
            </div>
            <p className="mt-2 text-xs italic text-gray-500 truncate">
                Última nota: {lastNoteText}
            </p>
        </div>
    );
};

// Componente principal
const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 

    // Função para buscar leads (Reutilizável)
    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) { setIsLoading(false); return; }
        setIsLoading(true); setError(null);
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            // Armazena todos os leads em um array simples
            setLeads(response.data); 
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) { logout(); setError('Sessão expirada. Faça login novamente.'); } 
            else { setError('Falha ao carregar leads. Verifique a conexão com a API.'); }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Função para mover Lead (Drag and Drop)
    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        
        // 1. Atualiza o estado local imediatamente 
        setLeads(prevLeads => prevLeads.map(lead => 
            lead._id === leadId ? { ...lead, status: newStatus } : lead
        ));
        
        // 2. Chama a API
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            // A API de updateLead no backend atualiza o status
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, { status: newStatus }, config);
            
            setToast({ message: `Lead movido para ${newStatus} com sucesso!`, type: 'success' });

        } catch (error) {
            setToast({ message: 'Falha ao atualizar status do lead.', type: 'error' });
            console.error('Erro ao mover lead:', error.response?.data || error.message);
            // Reverte o estado local em caso de falha
            fetchLeads(); 
        }
    };
    
    const allowDrop = (e) => e.preventDefault();

    const onDragStart = (e, leadId) => e.dataTransfer.setData('leadId', leadId);
    
    // --- Funções do Modal de Edição ---

    const openLeadModal = useCallback((lead) => {
        // Formata as notas para a estrutura que o Modal espera (objetos)
        const leadNotes = Array.isArray(lead.notes) 
            ? lead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
            : [];
            
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
    }, []);
    
    const handleSaveFeedback = useCallback((success, message) => {
        setToast({ message: message, type: success ? 'success' : 'error' });
    }, []);
    

    if (isLoading) return <div className="p-6 text-center text-indigo-600">Carregando Kanban...</div>;
    if (error) return <div className="p-6 text-center text-red-600 font-bold">Erro: {error}</div>;


    return (
        <div className="p-6 bg-gray-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">Kanban de Leads</h1>
                <button 
                    onClick={() => navigate('/leads/cadastro')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                    <FaPlus size={14} />
                    <span>Novo Lead</span>
                </button>
            </div>
            
            {/* Botão de ir para a Busca */}
            <div className="mb-6">
                <button 
                    onClick={() => navigate('/leads/busca')}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                >
                    <FaSearch size={14} /> <span>Ir para Busca de Leads</span>
                </button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    <div 
                        key={stage.id} 
                        onDragOver={allowDrop} 
                        onDrop={(e) => handleDrop(e, stage.id)}
                        className="flex-shrink-0 w-80 bg-white p-4 rounded-xl shadow-lg border-t-4 border-indigo-600"
                    >
                        <h2 className={`text-lg font-bold mb-4 flex justify-between items-center text-gray-800`}>
                            {stage.title}
                            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                {leads.filter(l => l.status === stage.id).length}
                            </span>
                        </h2>
                        
                        <div className="min-h-[100px]">
                            {leads.filter(lead => lead.status === stage.id).map(lead => (
                                <LeadCard 
                                    key={lead._id} 
                                    lead={lead} 
                                    onClick={openLeadModal} 
                                    onDragStart={onDragStart} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {selectedLead && (
                <LeadEditModal // <--- USA O COMPONENTE IMPORTADO
                    selectedLead={selectedLead}
                    isModalOpen={isModalOpen}
                    onClose={closeLeadModal}
                    onSave={handleSaveFeedback}
                    token={token}
                    fetchLeads={fetchLeads}
                />
            )}
        </div>
    );
};

export default KanbanBoard;