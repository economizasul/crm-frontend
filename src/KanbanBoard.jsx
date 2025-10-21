import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios';
// 1. IMPORTAR O HOOK DE AUTENTICAÇÃO
import { useAuth } from './AuthContext.jsx'; 
import LeadCard from './components/LeadCard.jsx';

// Definição estática das fases do Kanban
const STAGES = [
    { id: 1, title: 'Para Contatar', color: 'bg-blue-500' },
    { id: 2, title: 'Em Conversação', color: 'bg-yellow-500' },
    { id: 3, title: 'Proposta Enviada', color: 'bg-green-500' },
    { id: 4, title: 'Fechado', color: 'bg-gray-500' },
    { id: 5, title: 'Perdido', color: 'bg-red-500' },
];

const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [activeStage, setActiveStage] = useState(STAGES[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Loading da API
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const navigate = useNavigate(); 
    const location = useLocation();
    
    // 2. OBTER O ESTADO DE AUTENTICAÇÃO E O TOKEN DO CONTEXTO
    // isAuthReady garante que já lemos o localStorage
    // isAuthenticated diz se estamos logados
    // token é o próprio token
    // logout é a função para deslogar em caso de erro 401
    const { token, isAuthenticated, isAuthReady, logout } = useAuth();
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';
    const API_URL = `${API_BASE_URL}/api/v1/leads`;

    // EFEITO ÚNICO PARA BUSCAR OS LEADS
    useEffect(() => {
        // 3. NÃO FAÇA NADA ATÉ O AUTHCONTEXT ESTAR PRONTO
        if (!isAuthReady) {
            return; // Aguarda o AuthContext verificar o token no localStorage
        }

        // 4. SE ESTIVER PRONTO, MAS NÃO AUTENTICADO, REDIRECIONA
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // 5. SE ESTIVER PRONTO E AUTENTICADO, BUSCA OS DADOS
        const fetchLeads = async () => {
            setIsLoading(true); // Começa o loading dos dados
            
            try {
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                const response = await axios.get(API_URL, config); 
                setLeads(response.data || []); 
                setApiError(false);
            } catch (error) {
                console.error('Erro ao buscar leads:', error.response ? error.response.data : error.message);
                
                if (error.response && error.response.status === 401) {
                    // Se o token for inválido/expirado, usa a função logout do contexto
                    logout();
                    navigate('/login'); 
                }
                setApiError(true);
            } finally {
                setIsLoading(false); // Termina o loading dos dados
            }
        };

        fetchLeads();
        
    // 7. DEPENDE DO ESTADO DE AUTENTICAÇÃO DO CONTEXTO
    }, [isAuthReady, isAuthenticated, token, navigate, logout]); 

    // Abre modal automaticamente quando vier do LeadSearch
    useEffect(() => {
        if (!isLoading && leads.length > 0 && location.state && location.state.focusLeadId) {
            openLeadModal(location.state.focusLeadId);
            // Limpa o state da rota
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [isLoading, leads, location, navigate]);

    
    // ATENÇÃO: A tela de loading do App.jsx (ProtectedRoute) já cobre o !isAuthReady
    // Mas mantemos o isLoading para a requisição da API
    if (isLoading) { 
        return (
        <div className="flex-1 p-6">
            {/* ... (Resto do seu JSX do KanbanBoard) ... */}
        </div>
        );
    }
    
    // Filtro de pesquisa aplicado globalmente
    const normalizar = (valor) => (valor || '').toString().toLowerCase();
    const matchesSearch = (lead) => {
        if (!searchTerm) return true;
        const q = normalizar(searchTerm);
        return [
            lead.name,
            lead.email,
            lead.phone,
            lead.address,
            lead.origin,
            lead.document,
            lead.uc,
        ].some((v) => normalizar(v).includes(q));
    };

    // Handlers do modal de edição rápida (status/notas)
    const openLeadModal = (leadId) => {
        const lead = leads.find((l) => l.id === leadId);
        if (!lead) return;
        setSelectedLead({ ...lead, notesText: Array.isArray(lead.notes) ? lead.notes.join('\n') : '' });
        setIsModalOpen(true);
    };

    const closeLeadModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
    };

    const saveLeadChanges = async () => {
        if (!selectedLead) return;
        setSaving(true);
        try {
            const payload = {
                status: selectedLead.status,
                // converte texto de notas para array, linhas não vazias
                notes: (selectedLead.notesText || '')
                    .split('\n')
                    .map((n) => n.trim())
                    .filter((n) => n.length > 0),
                phone: selectedLead.phone || '',
                email: selectedLead.email || '',
                address: selectedLead.address || '',
                origin: selectedLead.origin || '',
                document: selectedLead.document || '',
                uc: selectedLead.uc || '',
                avgConsumption: selectedLead.avgConsumption || '',
                estimatedSavings: selectedLead.estimatedSavings || '',
            };
            await axios.patch(`${API_URL}/${selectedLead.id}`, payload, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Atualiza estado local
            setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, ...payload } : l)));
            setToastMessage('Lead atualizado com sucesso');
            closeLeadModal();
        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            setToastMessage('Falha ao salvar alterações do lead');
        } finally {
            setSaving(false);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };
    
    const renderSearchBar = () => (
        <div className="mb-6">
            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar leads por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>
    );
    
    const renderColumnContent = (stageId) => {
        // O isLoading principal já trata o carregamento inicial
        
        // Filtra os leads por status (título da etapa) e busca
        const stageTitle = STAGES.find((s) => s.id === stageId)?.title;
        const stageLeads = leads
            .filter((lead) => {
                const s = (lead.status || '').toLowerCase();
                const t = (stageTitle || '').toLowerCase();
                if (t === 'em conversação') {
                    return s === 'em conversação' || s === 'em negociacao' || s === 'em negociação';
                }
                return s === t;
            })
            .filter(matchesSearch);

        if (apiError && leads.length === 0) { // Mostra erro de conexão se não houver leads
            return (
                <div className="text-sm text-red-500 text-center mb-4 p-4 h-24 flex items-center justify-center border-dashed border-2 border-red-300 rounded">
                    Erro de conexão.
                </div>
            );
        }
        
        if (stageLeads.length === 0) {
            return (
                <div className="text-sm text-gray-500 mb-4 p-4 h-24 flex items-center justify-center border-dashed border-2 border-gray-300 rounded">
                    Nenhum Lead nesta etapa.
                </div>
            );
        }

        // Renderização dos cards de Lead
        return (
            <div>
                {stageLeads.map((lead) => (
                    <div key={lead.id} className="mb-2">
                        <LeadCard lead={lead} onClick={openLeadModal} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 p-6">
            
            {/* Toast simples */}
            {toastMessage && (
                <div className="bg-indigo-100 border border-indigo-300 text-indigo-800 px-4 py-2 rounded mb-4">
                    {toastMessage}
                </div>
            )}

            {/* BARRA DE PESQUISA */}
            {renderSearchBar()}
            
            {/* ALERTA DE ERRO GERAL (só mostra se o erro ocorreu após um carregamento inicial) */}
            {apiError && ( 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                    <FaBolt className="mr-3" />
                    <strong className="font-bold mr-1">Falha ao carregar os dados.</strong>
                    <span className="block sm:inline"> Verifique a API. (Pode ser erro de CORS/Rede)</span>
                </div>
            )}
            
            {/* ABAS DE FASES HORIZONTAIS */}
            <div className="flex flex-wrap space-x-6 mb-6">
                {STAGES.map(stage => {
                    const isActive = stage.id === activeStage;
                    const activeClasses = 'bg-indigo-600 text-white shadow-lg';
                    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';
                    
                    return (
                        <button
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={`flex-shrink-0 w-48 text-center py-3 rounded-xl font-bold transition-colors duration-200 text-sm md:text-base 
                                ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {stage.title}
                        </button>
                    );
                })}
            </div>

            {/* CONTAINER PRINCIPAL DAS COLUNAS */}
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-48 p-3 bg-white rounded-lg shadow-md"
                    >
                        {renderColumnContent(stage.id)} 
                        
                        {/* Botão Novo Lead */}
                        <button onClick={() => navigate('/leads/cadastro')} className="w-full py-2 px-4 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-100 transition duration-150 flex items-center justify-center space-x-2">
                            <span>+ Novo Lead</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal de Edição Rápida */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Atendimento do Lead</h3>
                            <button onClick={closeLeadModal} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input className="w-full border rounded px-3 py-2 bg-gray-50" value={selectedLead.name || ''} disabled />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.phone || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, phone: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.email || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={selectedLead.status || 'Para Contatar'}
                                    onChange={(e) => setSelectedLead((prev) => ({ ...prev, status: e.target.value }))}
                                >
                                    {STAGES.map((s) => (
                                        <option key={s.id} value={s.title}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.address || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, address: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.origin || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, origin: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.document || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, document: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UC</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.uc || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, uc: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumo Médio (kWh)</label>
                                    <input
                                      type="number"
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.avgConsumption || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, avgConsumption: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Economia Estimada</label>
                                    <input
                                      className="w-full border rounded px-3 py-2"
                                      value={selectedLead.estimatedSavings || ''}
                                      onChange={(e) => setSelectedLead((p) => ({ ...p, estimatedSavings: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    rows={4}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Adicione notas (uma por linha)"
                                    value={selectedLead.notesText || ''}
                                    onChange={(e) => setSelectedLead((prev) => ({ ...prev, notesText: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={closeLeadModal} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                            <button onClick={saveLeadChanges} disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;