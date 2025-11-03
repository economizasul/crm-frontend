// src/KanbanBoard.jsx - CÓDIGO FINAL LIMPO E REFATORADO
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
// Importa o componente de Modal refatorado
import LeadEditModal from './LeadEditModal.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores (exportado para uso no LeadEditModal)
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Pimeiro Contato': 'bg-blue-200 text-blue-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
    'Em Negociação': 'bg-yellow-220 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
};

// Componente simples de Toast para feedback (inalterado)
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

// Componente Card de Lead (inalterado)
const LeadCard = ({ lead, onClick }) => {
    return (
        <div 
            onClick={() => onClick(lead)}
            className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition duration-150 ease-in-out"
        >
            <h3 className="font-semibold text-gray-800">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.phone}</p>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STAGES[lead.status] || STAGES.Novo} mt-1 inline-block`}>
                {lead.status}
            </span>
        </div>
    );
};


const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState(''); 
    const [searchResult, setSearchResult] = useState(null);

    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    // REMOVIDOS: leadData, newNoteText, saving (movidos para LeadEditModal.jsx)


    // Função para buscar os leads
    const fetchLeads = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setApiError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Mapeia snake_case para camelCase para o estado do Frontend
            setLeads(response.data.map(lead => ({
                ...lead,
                // Garantir que avgConsumption e estimatedSavings estejam como camelCase para uso no modal/payload
                avgConsumption: lead.avg_consumption, 
                estimatedSavings: lead.estimated_savings,
                // Garantir que as notas estejam em formato de array, se necessário
                notes: lead.notes ? (typeof lead.notes === 'string' ? JSON.parse(lead.notes) : lead.notes) : [],
            })));
            setIsLoading(false);
        } catch (error) {
            console.error("Erro ao buscar leads:", error);
            if (error.response && error.response.status === 401) {
                logout();
                navigate('/login');
            }
            setApiError('Falha ao carregar leads. Tente novamente.');
            setIsLoading(false);
        }
    }, [token, navigate, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);
    
    // Lógica de filtragem (inalterada)
    const handleSearch = (term) => {
        setSearchTerm(term);
        
        if (term.trim() === '') {
            setSearchResult(null);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        
        const foundLead = leads.find(lead => 
            (lead.name && lead.name.toLowerCase().includes(lowerCaseTerm)) ||
            (lead.phone && lead.phone.includes(lowerCaseTerm)) ||
            (lead.document && lead.document.includes(lowerCaseTerm))
        );

        if (foundLead) {
            setSearchResult(foundLead);
        } else {
            setSearchResult('not_found');
        }
    };
    
    // Lógica SIMPLIFICADA para abrir o modal de edição
    const openLeadModal = useCallback((lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    }, []);

    // Lógica SIMPLIFICADA para fechar o modal
    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        // O LeadEditModal será responsável por chamar o fetchLeads se houver um SAVE bem-sucedido
    }, []);
    
    // NOVO: Função para o LeadEditModal retornar feedback
    const handleSaveFeedback = useCallback((isSuccess, message) => {
        setToast({ message, type: isSuccess ? 'success' : 'error' });
        // Chamado por LeadEditModal, o fetchLeads já foi executado lá dentro.
    }, []);

    // REMOVIDOS: handleChange, addNewNote, saveLeadChanges (movidos para LeadEditModal.jsx)
    // REMOVIDOS: getGoogleMapsLink, getWhatsAppLink (movidos para funções auxiliares no LeadEditModal.jsx)
    
    // Lógica de Drag and Drop (inalterada, mantém a correção)
    const handleDrop = async (leadId, newStatus) => {
        const idAsString = String(leadId); 

        const leadToUpdate = leads.find(l => 
            (l.id && String(l.id) === idAsString) || (l._id && String(l._id) === idAsString)
        );
        
        if (!leadToUpdate || leadToUpdate.status === newStatus) return;

        const oldStatus = leadToUpdate.status;

        // ATUALIZAÇÃO IMUTÁVEL CORRETA DO ESTADO LOCAL
        setLeads(prevLeads => prevLeads.map(l => {
            const currentLeadId = l.id || l._id;
            
            if (String(currentLeadId) === idAsString) {
                return { 
                    ...l, 
                    status: newStatus,
                    updated_at: new Date().toISOString() 
                };
            }
            return l;
        }));

        // CHAMA A API PARA ATUALIZAR NO BACKEND
        try {
            const notesToSave = Array.isArray(leadToUpdate.notes) 
                ? JSON.stringify(leadToUpdate.notes) 
                : leadToUpdate.notes || '[]';

            const dataToSend = {
                // CRÍTICO: apenas os campos necessários, mas o status é o que muda.
                status: newStatus, 
                // Mapeamento e conversão de tipo (usando as propriedades camelCase mapeadas no fetch)
                avg_consumption: parseFloat(leadToUpdate.avgConsumption) || null,
                estimated_savings: parseFloat(leadToUpdate.estimatedSavings) || null,
                notes: notesToSave,
                owner_id: leadToUpdate.owner_id, 
                // Inclui todos os outros campos para garantir que o PUT na API não zere dados
                name: leadToUpdate.name, phone: leadToUpdate.phone, document: leadToUpdate.document,
                address: leadToUpdate.address, origin: leadToUpdate.origin, email: leadToUpdate.email,
                uc: leadToUpdate.uc, qsa: leadToUpdate.qsa, lat: leadToUpdate.lat, lng: leadToUpdate.lng,
            };
            
            await axios.put(`${API_BASE_URL}/api/v1/leads/${idAsString}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setToast({ message: `Status de ${leadToUpdate.name} atualizado para ${newStatus}!`, type: 'success' });
            
        } catch (error) {
            console.error("Erro ao arrastar e soltar (Drag/Drop):", error);
            
            // Rollback do estado no frontend em caso de erro na API
            setLeads(prevLeads => prevLeads.map(l => {
                const currentLeadId = l.id || l._id;
                if (String(currentLeadId) === idAsString) {
                    return { ...l, status: oldStatus };
                }
                return l;
            }));
            
            setToast({ message: error.response?.data?.error || 'Falha ao mudar status. Recarregando.', type: 'error' });
            fetchLeads(); // Força a sincronização
        }
    };
    
    // Renderiza as colunas do Kanban (inalterada na lógica)
    const renderColumns = () => {
        if (searchResult && searchResult !== 'not_found') {
            const status = searchResult.status;
            
            return (
                <div 
                    key={status} 
                    className="flex-shrink-0 w-44 bg-white p-3 rounded-lg shadow-lg border-4 border-green-500" 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData("leadId");
                        handleDrop(leadId, status);
                    }}
                >
                    <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status] || 'text-gray-800'}`}>
                        {status} (1) 
                        <span className="text-sm font-normal text-green-500 block"> - Lead Encontrado</span>
                    </h2>
                    
                    <div
                        key={searchResult.id || searchResult._id}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("leadId", (searchResult.id || searchResult._id).toString());
                        }}
                    >
                        <LeadCard lead={searchResult} onClick={openLeadModal} />
                    </div>
                </div>
            );
        }
        
        const columns = Object.keys(STAGES).map(status => {
            const statusLeads = leads.filter(lead => lead.status === status);
            return (
                <div 
                    key={status} 
                    className="flex-shrink-0 w-44 bg-white p-3 rounded-lg shadow-lg"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData("leadId");
                        handleDrop(leadId, status);
                    }}
                >
                    <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status] || 'text-gray-800'}`}>
                        {status} ({statusLeads.length})
                    </h2>
                    
                    {statusLeads.map(lead => (
                        <div 
                            key={lead.id || lead._id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData("leadId", (lead.id || lead._id).toString());
                            }}
                        >
                            <LeadCard lead={lead} onClick={openLeadModal} />
                        </div>
                    ))}
                    
                    {statusLeads.length === 0 && (
                        <p className="text-gray-500 text-sm italic pt-2">Nenhum lead nesta etapa.</p>
                    )}
                </div>
            );
        });
        return columns;
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-full text-indigo-600 text-lg">Carregando Leads...</div>;
    }

    if (apiError) {
        return <div className="p-8 text-center text-red-600">{apiError}</div>;
    }

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1>
            
            <div className="mb-6 flex items-center space-x-4">
                <div className="relative flex-1 max-w-lg">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por Nome, Telefone ou Documento..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                </div>
                {searchResult === 'not_found' && searchTerm.trim() !== '' && (
                    <span className="text-red-500 font-medium">Lead não encontrado.</span>
                )}
                {searchResult && searchResult !== 'not_found' && (
                    <button onClick={() => setSearchResult(null)} className="text-sm px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition">
                        Limpar Pesquisa <FaTimes className="inline ml-1" />
                    </button>
                )}
            </div>
            
            {/* Container do Kanban */}
            <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]"> 
                {renderColumns()}
            </div>

            {/* Componente Modal de Edição Refatorado */}
            {isModalOpen && selectedLead && (
                <LeadEditModal 
                    selectedLead={selectedLead}
                    isModalOpen={isModalOpen}
                    onClose={closeLeadModal} 
                    onSave={handleSaveFeedback} // Callback para mostrar o Toast
                    token={token}
                    fetchLeads={fetchLeads} // Passa o fetchLeads para o modal poder atualizar a lista após salvar ou transferir
                />
            )}
        </div>
    );
};

export default KanbanBoard;