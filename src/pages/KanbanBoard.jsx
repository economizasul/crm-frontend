// src/pages/KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaMapMarkerAlt, FaWhatsapp, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../AuthContext.jsx';
import LeadEditModal from '../components/LeadEditModal.jsx';

export const STAGES = {
  'Novo': 'bg-gray-600 text-gray-200 border-gray-300',
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

const LeadCard = ({ lead, onClick }) => {
  const getContactBorderClass = (nextContactDate) => {
    if (!nextContactDate) return 'border-gray-500'; // Sem data → cinza

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contactDate = new Date(nextContactDate);
    contactDate.setHours(0, 0, 0, 0);

    // diffDays positivo = atrasado; negativo = futuro
    const diffDays = Math.floor((today - contactDate) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'border-gray-500'; // Futuro → cinza (sem urgência)

    if (diffDays === 1) return 'border-4 border-green-600';         // Hoje: verde forte
    if (diffDays === 2) return 'border-4 border-yellow-400';        // 1 dia atrasado: amarelo claro
    if (diffDays === 3) return 'border-4 border-orange-600';        // 2 dias atrasado: laranja forte
    if (diffDays >= 4) return 'border-4 border-red-600';            // 3+ dias: vermelho forte

    return 'border-gray-500';
  };

  return (
    <div
      onClick={() => onClick(lead)}
      className={`bg-gray-900 p-4 rounded-lg shadow-md mb-3 cursor-move hover:shadow-xl hover:border-indigo-500 transition-all transform hover:scale-105 select-none border-2 ${getContactBorderClass(lead.nextContactDate)}`}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', String(lead.id));
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      <h4 className="font-bold text-gray-100 truncate">{lead.name}</h4>
      <p className="text-sm text-gray-300">{lead.phone}</p>
      {lead.uc && <p className="text-xs text-gray-400 mt-1">UC: {lead.uc}</p>}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
        <FaUserTie /> <span className="truncate">{lead.ownerName || 'Sem vendedor'}</span>
      </div>
      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${STAGES[lead.status] || STAGES.Novo}`}>
        {lead.status}
      </span>
    </div>
  );
};

const KanbanBoard = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const navigate = useNavigate();
  const { logout, user, token } = useAuth();

  // Debounce no termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchLeads = useCallback(async (searchQuery = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await api.get(`/leads?${params.toString()}`);
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
        createdAt: lead.createdAt || lead.created_at,
        reasonForLoss: lead.reason_for_loss || lead.reasonForLoss || '',
          nextContactDate: lead.next_contact_date || lead.nextContactDate || null,
      }));

      const filteredByPermission = user.role === 'Admin'
        ? mappedLeads
        : mappedLeads.filter(lead => Number(lead.owner_id) === Number(userId));

      setLeads(filteredByPermission);
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

  // Carrega leads quando o usuário entra ou quando o termo de busca muda
  useEffect(() => {
    if (user) {
      fetchLeads(debouncedSearchTerm);
      fetchUsers();
    }
  }, [user, debouncedSearchTerm, fetchLeads, fetchUsers]);

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    fetchLeads(debouncedSearchTerm); // Recarrega após edição
  };

  const handleDrop = async (leadId, newStatus) => {
    const id = Number(leadId);
    const lead = leads.find(l => l.id === id);
    if (!lead || lead.status === newStatus) return;

    const oldStatus = lead.status;

    // Atualiza UI imediatamente
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setToast({ message: `Lead movido para "${newStatus}"!`, type: 'success' });
    } catch (error) {
      // Reverte UI em caso de erro
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: oldStatus } : l));
      setToast({ message: 'Erro ao mover lead', type: 'error' });
    }
    // Recarrega para garantir consistência
    fetchLeads(debouncedSearchTerm);
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
            placeholder="Buscar por Nome, Telefone, Email, UC ou Documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8">
        {Object.keys(STAGES).map(status => {
          // Apenas filtra por status (a busca já foi feita no backend)
          let statusLeads = leads
            .filter(l => l.status === status)
            // Ordena do mais recente para o mais antigo
            .sort((a, b) => {
              // Primeiro: leads com data de contato definida e mais urgentes (atrasados ou hoje)
              const dateA = a.nextContactDate ? new Date(a.nextContactDate) : null;
              const dateB = b.nextContactDate ? new Date(b.nextContactDate) : null;

              if (dateA && !dateB) return -1; // A tem data → topo
              if (!dateA && dateB) return 1;  // B tem data → A para baixo
              if (dateA && dateB) {
                return dateA - dateB; // mais antiga (atrasada) no topo
              }
              // Se nenhum tem data, ordena por criação (mais novo no topo)
              return (b.createdAt || b.id) - (a.createdAt || a.id);
            });

          // Limita apenas colunas finais aos 10 mais recentes
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

      {isModalOpen && selectedLead && (
        <LeadEditModal
          selectedLead={selectedLead}
          isModalOpen={isModalOpen}
          onClose={closeLeadModal}
          onSave={fetchLeads}
          token={token}
          fetchLeads={() => fetchLeads(debouncedSearchTerm)}
          users={users}
        />
      )}
    </div>
  );
};

export default KanbanBoard;