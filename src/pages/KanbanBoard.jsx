// src/pages/KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaMapMarkerAlt, FaWhatsapp, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../AuthContext.jsx';
import LeadEditModal from '../components/LeadEditModal.jsx';

// 🟢 CORREÇÃO: Adicionado 'export' para que LeadEditModal possa importar.
export const STAGES = {
  'Novo': 'bg-gray-400 text-gray-200 border-gray-300',
  'Contato': 'bg-blue-200 text-blue-400 border-blue-300',
  'Rechame': 'bg-blue-100 text-blue-800 border-blue-300',
  'Retorno': 'bg-indigo-200 text-indigo-700 border-indigo-300',
  'Conversando': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Simulação': 'bg-purple-100 text-purple-800 border-purple-300',
  'Ganho': 'bg-green-100 text-green-800 border-green-300',
  'Perdido': 'bg-red-100 text-red-800 border-red-300',
  'Inapto': 'bg-orange-100 text-orange-800 border-red-300',
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl text-white font-bold ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}>
      {message}
    </div>
  );
};

const LeadCard = ({ lead, onClick }) => (
  <div
    onClick={() => onClick(lead)}
    className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-3 cursor-move hover:shadow-xl hover:border-indigo-500 transition-all transform hover:scale-105 select-none"
    draggable="true"
    onDragStart={(e) => {
      e.dataTransfer.setData('leadId', String(lead.id)); // GARANTE STRING
      e.currentTarget.style.opacity = '0.5';
    }}
    onDragEnd={(e) => {
      e.currentTarget.style.opacity = '1';
    }}
  >
    <h4 className="font-bold text-gray-600 truncate">{lead.name}</h4>
    <p className="text-sm text-gray-600">{lead.phone}</p>
    {lead.uc && <p className="text-xs text-gray-500 mt-1">UC: {lead.uc}</p>}
    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
      <FaUserTie /> <span className="truncate">{lead.ownerName || 'Sem vendedor'}</span>
    </div>
    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${STAGES[lead.status] || STAGES.Novo}`}>
      {lead.status}
    </span>
  </div>
);

const KanbanBoard = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { logout, user, token } = useAuth(); // token é necessário para o Modal

  const [leadData, setLeadData] = useState({
    name: '', phone: '', email: '', document: '', address: '', status: 'Novo',
    origin: '', uc: '', avgConsumption: '', estimatedSavings: '', qsa: '', notes: [], owner_id: ''
  });

  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'Admin') return;
    try {
      const res = await api.get('/users');
      const raw = Array.isArray(res.data) ? res.data : (res.data?.users || res.data?.data || []);
      const allUsers = raw
        .filter(u => u && (u.id || u._id))
        .map(u => ({
          id: u.id || u._id,
          name: u.name || u.nome || 'Sem Nome',
          email: u.email || 'sem@email.com'
        }));
      setUsers(allUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  }, [user]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/leads');
      const rawLeads = response.data || [];
      
      const userId = user?.id || user?._id;
      if (userId === undefined) {
        setLeads([]);
        setIsLoading(false);
        return;
      }

      const mappedLeads = rawLeads.map(lead => ({
        id: lead.id,
        name: lead.name || 'Sem nome',
        phone: lead.phone || '',
        email: lead.email || '',
        status: lead.status || 'Novo',
        owner_id: lead.owner_id || lead.ownerId || lead.owner?.id || '',
        ownerName: lead.ownerName || lead.owner?.name || 'Desconhecido',
        document: lead.document || '',
        uc: lead.uc || '',
        avgConsumption: lead.avg_consumption || lead.avgConsumption || '',
        estimatedSavings: lead.estimated_savings || lead.estimatedSavings || '',
        qsa: lead.qsa || '',
        address: lead.address || '',
        origin: lead.origin || '',
        notes: Array.isArray(lead.notes) 
          ? lead.notes 
          : (typeof lead.notes === 'string' ? JSON.parse(lead.notes).catch(() => []) : []),
        createdAt: lead.createdAt,
        // Garante que o campo 'reasonForLoss' venha no objeto
        reasonForLoss: lead.reason_for_loss || lead.reasonForLoss || '', 
      }));

      const filteredLeads = user.role === 'Admin'
        ? mappedLeads
        : mappedLeads.filter(lead => Number(lead.owner_id) === Number(userId));

      setLeads(filteredLeads);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchUsers();
    }
  }, [user, fetchLeads, fetchUsers]);

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    // O leadData setado aqui é redundante, mas mantemos a chamada para não quebrar.
    setLeadData({
      ...lead,
      avgConsumption: lead.avgConsumption || '',
      estimatedSavings: lead.estimatedSavings || '',
      owner_id: lead.owner_id || ''
    });
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    fetchLeads(); // RECARREGA APÓS FECHAR
  };

  const handleDrop = async (leadId, newStatus) => {
    const id = Number(leadId); // Garante número
    const lead = leads.find(l => l.id === id);
    if (!lead || lead.status === newStatus) return;

    const oldStatus = lead.status;

    // Atualiza UI imediatamente
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setToast({ message: `Lead movido para "${newStatus}"!`, type: 'success' });
    } catch (error) {
      // Reverte UI
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: oldStatus } : l));
      setToast({ message: 'Erro ao mover lead', type: 'error' });
    }
    // SEMPRE RECARREGA
    fetchLeads();
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-3xl text-indigo-600">Carregando...</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Kanban de Leads</h1>
        <button onClick={() => navigate('/leads/new')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl flex items-center gap-3">
          <FaPlus /> Novo Lead
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lead..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8">
        {Object.keys(STAGES).map(status => {
          // Filtra leads da coluna + busca
          let statusLeads = leads
            .filter(l => l.status === status)
            .filter(l => !searchTerm || l.name.toLowerCase().includes(searchTerm.toLowerCase()))
            // Ordena do mais recente para o mais antigo (baseado em createdAt ou id)
            .sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id));

          // LIMITA APENAS "Ganho" e "Perdido" aos 10 mais recentes
          if (status === 'Ganho' || status === 'Perdido' || status === 'Inapto') {
            statusLeads = statusLeads.slice(0, 10);
          }

          return (
            <div
              key={status}
              className="flex-shrink-0 w-44 bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 transition-all"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = '#f0fdf4';
                e.currentTarget.style.borderColor = '#22c55e';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = '';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = '';
                const leadId = e.dataTransfer.getData('leadId');
                if (leadId) handleDrop(leadId, status);
              }}
            >
              <h2 className={`text-lg font-bold mb-4 px-4 py-2 rounded-lg ${STAGES[status]} border-2`}>
                {status}{' '}
                <span className="ml-2 bg-white px-2 py-1 rounded-full text-sm font-bold">
                  {statusLeads.length}
                  {/* Mostra "+" se tiver mais de 10 ocultos */}
                  {(status === 'Ganho' || status === 'Perdido' || status === 'Inapto') && 
                  leads.filter(l => l.status === status).length > 10 && '+'}
                </span>
              </h2>
              
              <div className="space-y-3">
                {statusLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onClick={openLeadModal} />
                ))}
                {statusLeads.length === 0 && (
                  <p className="text-center text-gray-400 italic py-12 text-sm">Arraste leads aqui</p>
                )}
              </div>
            </div>
          );
          })}
      </div>

      {/* MODAL DE EDIÇÃO EXTERNA */}
      {isModalOpen && selectedLead && (
        <LeadEditModal 
          selectedLead={selectedLead}
          isModalOpen={isModalOpen}
          onClose={closeLeadModal}
          onSave={fetchLeads} // Passa a função para que a modal recarregue os leads após salvar
          token={token} // Passa o token
          fetchLeads={fetchLeads} // Para recarregar após drag and drop
          users={users} // Passa a lista de usuários para a transferência
        />
      )}
    </div>
  );
};

export default KanbanBoard;