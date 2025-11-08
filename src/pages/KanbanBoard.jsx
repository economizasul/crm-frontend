// src/pages/KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaMapMarkerAlt, FaWhatsapp, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../AuthContext.jsx';

const STAGES = {
  'Novo': 'bg-gray-100 text-gray-800 border-gray-300',
  'Pimeiro Contato': 'bg-blue-100 text-blue-800 border-blue-300',
  'Retorno Agendado': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Em Negociação': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Proposta Enviada': 'bg-purple-100 text-purple-800 border-purple-300',
  'Ganho': 'bg-green-100 text-green-800 border-green-300',
  'Perdido': 'bg-red-100 text-red-800 border-red-300',
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
    className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-3 cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all transform hover:scale-105"
    draggable
    onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id)}
  >
    <h4 className="font-bold text-gray-800 truncate">{lead.name}</h4>
    <p className="text-sm text-gray-600">{lead.phone}</p>
    {lead.uc && <p className="text-xs text-gray-500 mt-1">UC: {lead.uc}</p>}
    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${STAGES[lead.status] || STAGES.Novo}`}>
      {lead.status}
    </span>
  </div>
);

const formatNoteDate = (timestamp) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(timestamp));
};

const KanbanBoard = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [leadData, setLeadData] = useState({
    name: '', phone: '', email: '', document: '', address: '', status: 'Novo',
    origin: '', uc: '', avgConsumption: '', estimatedSavings: '', qsa: '', notes: []
  });

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/leads');
      const rawLeads = response.data;

      const mappedLeads = rawLeads.map(lead => ({
        id: lead._id || lead.id,
        name: lead.name || 'Sem nome',
        phone: lead.phone || '',
        email: lead.email || '',
        status: lead.status || 'Novo',
        owner_id: lead.ownerId || lead.owner_id,
        ownerName: lead.ownerName || 'Desconhecido',
        document: lead.document || '',
        uc: lead.uc || '',
        avgConsumption: lead.avgConsumption || '',
        estimatedSavings: lead.estimatedSavings || '',
        qsa: lead.qsa || '',
        address: lead.address || '',
        origin: lead.origin || '',
        notes: Array.isArray(lead.notes) ? lead.notes : [],
        createdAt: lead.createdAt,
      }));

      const userId = String(user?.id || user?._id || '');
      const filteredLeads = user?.role === 'Admin'
        ? mappedLeads
        : mappedLeads.filter(lead => String(lead.owner_id) === userId);

      setLeads(filteredLeads);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      if (error.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate]);

  useEffect(() => { if (user) fetchLeads(); }, [user, fetchLeads]);

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setLeadData({
      ...lead,
      avgConsumption: lead.avgConsumption || '',
      estimatedSavings: lead.estimatedSavings || '',
    });
    setNewNoteText('');
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    setNewNoteText('');
    fetchLeads();
  };

  const saveLeadChanges = async () => {
    if (!selectedLead) return;
    setSaving(true);

    try {
      const payload = {
        name: leadData.name?.trim(),
        phone: leadData.phone?.replace(/\D/g, ''),
        email: leadData.email?.trim() || null,
        document: leadData.document?.trim() || null,
        address: leadData.address?.trim() || '',
        status: leadData.status,
        origin: leadData.origin?.trim() || '',
        uc: leadData.uc?.trim() || null,
        avg_consumption: leadData.avgConsumption ? parseFloat(leadData.avgConsumption) : null,
        estimated_savings: leadData.estimatedSavings ? parseFloat(leadData.estimatedSavings) : null,
        qsa: leadData.qsa?.trim() || null,
      };

      if (newNoteText.trim()) {
        payload.newNote = {
          text: newNoteText.trim(),
          timestamp: Date.now(),
          user: user?.name || 'Usuário'
        };
      }

      await api.put(`/leads/${selectedLead.id}`, payload);
      setToast({ message: 'Lead atualizado com sucesso!', type: 'success' });
      closeLeadModal();
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Erro ao salvar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (leadId, newStatus) => {
    const lead = leads.find(l => String(l.id) === String(leadId));
    if (!lead || lead.status === newStatus) return;

    const oldStatus = lead.status;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: oldStatus } : l));
      fetchLeads();
    }
  };

  const getGoogleMapsLink = () => leadData.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(leadData.address)}` : null;
  const getWhatsAppLink = () => {
    if (!leadData.phone) return null;
    const phone = leadData.phone.replace(/\D/g, '');
    const formatted = phone.startsWith('55') ? phone : `55${phone}`;
    const msg = encodeURIComponent(`Olá, ${leadData.name || 'Lead'}, estou entrando em contato sobre sua proposta de energia solar.`);
    return `https://web.whatsapp.com/send?phone=${formatted}&text=${msg}`;
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // busca simples
            }}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>
      </div>

      {/* KANBAN COM COLUNAS COMPACTAS E ALTURA DINÂMICA */}
      <div className="flex gap-4 overflow-x-auto pb-8">
        {Object.keys(STAGES).map(status => {
          const statusLeads = leads.filter(l => l.status === status);
          return (
            <div
              key={status}
              className="flex-shrink-0 w-44 bg-white p-4 rounded-lg shadow-lg"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleDrop(e.dataTransfer.getData("leadId"), status); }}
            >
              <h2 className={`text-lg font-bold mb-4 px-4 py-2 rounded-lg ${STAGES[status]} border-2`}>
                {status} <span className="ml-2 bg-white px-2 py-1 rounded-full text-sm">{statusLeads.length}</span>
              </h2>
              <div className="space-y-3 min-h-0">
                {statusLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onClick={openLeadModal} />
                ))}
                {statusLeads.length === 0 && (
                  <p className="text-center text-gray-400 italic py-8">Vazio</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL COMPACTO E COMPLETO */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b-2">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Editar Lead</h2>
                <button onClick={closeLeadModal} className="text-gray-500 hover:text-red-600"><FaTimes size={28} /></button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input value={leadData.name} onChange={e => setLeadData(p => ({...p, name: e.target.value}))} placeholder="Nome" className="p-3 border rounded-lg" />
                <input value={leadData.phone} onChange={e => setLeadData(p => ({...p, phone: e.target.value}))} placeholder="Telefone" className="p-3 border rounded-lg" />
                <input value={leadData.email || ''} onChange={e => setLeadData(p => ({...p, email: e.target.value}))} placeholder="Email" className="p-3 border rounded-lg" />
                <input value={leadData.document || ''} onChange={e => setLeadData(p => ({...p, document: e.target.value}))} placeholder="CPF/CNPJ" className="p-3 border rounded-lg" />
                <input value={leadData.uc || ''} onChange={e => setLeadData(p => ({...p, uc: e.target.value}))} placeholder="UC" className="p-3 border rounded-lg" />
                <input value={leadData.address || ''} onChange={e => setLeadData(p => ({...p, address: e.target.value}))} placeholder="Endereço" className="col-span-2 p-3 border rounded-lg" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <input value={leadData.avgConsumption} onChange={e => setLeadData(p => ({...p, avgConsumption: e.target.value}))} placeholder="Consumo Médio (kWh)" className="p-3 border rounded-lg" />
                <input value={leadData.estimatedSavings} onChange={e => setLeadData(p => ({...p, estimatedSavings: e.target.value}))} placeholder="Economia Estimada (R$)" className="p-3 border rounded-lg" />
                <select value={leadData.status} onChange={e => setLeadData(p => ({...p, status: e.target.value}))} className="p-3 border rounded-lg">
                  {Object.keys(STAGES).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <textarea value={leadData.qsa || ''} onChange={e => setLeadData(p => ({...p, qsa: e.target.value}))} placeholder="QSA (Sócios)" rows="3" className="w-full p-3 border rounded-lg" />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">Notas</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {leadData.notes.length === 0 ? <p className="text-gray-500 italic">Sem notas</p> : leadData.notes.map((n, i) => (
                    <div key={i} className="bg-white p-3 rounded border text-sm">
                      <p>{n.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.user} - {formatNoteDate(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), saveLeadChanges())}
                    placeholder="Nova nota..."
                    className="flex-1 p-3 border rounded-lg"
                  />
                  <button onClick={saveLeadChanges} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">
                    <FaSave />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-3">
                  {leadData.address && <a href={getGoogleMapsLink()} target="_blank" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><FaMapMarkerAlt /> Maps</a>}
                  {leadData.phone && <a href={getWhatsAppLink()} target="_blank" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><FaWhatsapp /> WhatsApp</a>}
                </div>
                <div className="flex gap-3">
                  <button onClick={closeLeadModal} className="px-6 py-3 border-2 border-gray-400 rounded-lg font-bold">Cancelar</button>
                  <button onClick={saveLeadChanges} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold shadow-lg disabled:opacity-50">
                    {saving ? 'Salvando...' : 'Salvar Tudo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;