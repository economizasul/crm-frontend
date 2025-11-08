// src/pages/KanbanBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js'; // AGORA USA O api.js CORRETO
import { useAuth } from '../AuthContext.jsx';

const STAGES = {
  'Novo': 'bg-gray-200 text-gray-800',
  'Pimeiro Contato': 'bg-blue-200 text-blue-800',
  'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
  'Em Negociação': 'bg-yellow-220 text-yellow-800',
  'Proposta Enviada': 'bg-purple-200 text-purple-800',
  'Ganho': 'bg-green-200 text-green-800',
  'Perdido': 'bg-red-200 text-red-800',
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`p-3 rounded-lg text-white font-medium shadow-lg fixed top-4 right-4 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {message}
    </div>
  );
};

const LeadCard = ({ lead, onClick }) => (
  <div onClick={() => onClick(lead)} className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition">
    <h3 className="font-semibold text-gray-800">{lead.name}</h3>
    <p className="text-sm text-gray-600">{lead.phone}</p>
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STAGES[lead.status] || STAGES.Novo} mt-1 inline-block`}>
      {lead.status}
    </span>
  </div>
);

const formatNoteDate = (timestamp) => {
  if (!timestamp) return 'Sem Data';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp));
  } catch {
    return 'Data Inválida';
  }
};

const KanbanBoard = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
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
    name: '', phone: '', document: '', address: '', status: '', origin: '', email: '',
    uc: '', avgConsumption: '', estimatedSavings: '', qsa: '', notes: [], lat: null, lng: null
  });

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await api.get('/leads');
      const mappedLeads = response.data.map(lead => ({
        ...lead,
        id: lead.id || lead._id,
        avgConsumption: lead.avg_consumption || '',
        estimatedSavings: lead.estimated_savings || '',
        notes: typeof lead.notes === 'string' ? JSON.parse(lead.notes) : (lead.notes || [])
      }));

      // FILTRA NO FRONTEND: VENDEDORES SÓ VEEM SEUS LEADS
      const filtered = user?.role === 'Admin' 
        ? mappedLeads 
        : mappedLeads.filter(l => String(l.owner_id || l.vendedor_id) === String(user?.id));

      setLeads(filtered);
      console.log('Leads carregados (filtrados):', filtered);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setApiError('Erro ao carregar leads. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResult(null);
      return;
    }
    const found = leads.find(l =>
      l.name?.toLowerCase().includes(term.toLowerCase()) ||
      l.phone?.includes(term) ||
      l.document?.includes(term)
    );
    setSearchResult(found || 'not_found');
  };

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setLeadData({
      ...lead,
      avgConsumption: lead.avgConsumption || '',
      estimatedSavings: lead.estimatedSavings || '',
      notes: lead.notes || []
    });
    setNewNoteText('');
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    fetchLeads();
  };

  const saveLeadChanges = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const dataToSend = {
        ...leadData,
        owner_id: selectedLead.owner_id,
        avg_consumption: leadData.avgConsumption ? parseFloat(leadData.avgConsumption) : null,
        estimated_savings: leadData.estimatedSavings ? parseFloat(leadData.estimatedSavings) : null,
        notes: JSON.stringify(leadData.notes)
      };

      await api.put(`/leads/${selectedLead.id}`, dataToSend);
      setToast({ message: 'Lead atualizado!', type: 'success' });
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
      setToast({ message: `Status alterado para ${newStatus}!`, type: 'success' });
    } catch (error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: oldStatus } : l));
      setToast({ message: 'Erro ao mover lead', type: 'error' });
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

  const renderColumns = () => {
    if (searchResult && searchResult !== 'not_found') {
      const lead = searchResult;
      return (
        <div key={lead.status} className="flex-shrink-0 w-44 bg-white p-3 rounded-lg shadow-lg border-4 border-green-500"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleDrop(e.dataTransfer.getData("leadId"), lead.status); }}>
          <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[lead.status]}`}>{lead.status} (1)</h2>
          <div draggable onDragStart={e => e.dataTransfer.setData("leadId", lead.id)}>
            <LeadCard lead={lead} onClick={openLeadModal} />
          </div>
        </div>
      );
    }

    return Object.keys(STAGES).map(status => {
      const statusLeads = leads.filter(l => l.status === status);
      return (
        <div key={status} className="flex-shrink-0 w-44 bg-white p-3 rounded-lg shadow-lg"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleDrop(e.dataTransfer.getData("leadId"), status); }}>
          <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status]}`}>{status} ({statusLeads.length})</h2>
          {statusLeads.map(lead => (
            <div key={lead.id} draggable onDragStart={e => e.dataTransfer.setData("leadId", lead.id)}>
              <LeadCard lead={lead} onClick={openLeadModal} />
            </div>
          ))}
          {statusLeads.length === 0 && <p className="text-gray-500 text-sm italic pt-2">Vazio</p>}
        </div>
      );
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-full text-indigo-600 text-2xl">Carregando Leads...</div>;
  if (apiError) return <div className="p-8 text-center text-red-600 text-xl">{apiError}</div>;

  return (
    <div className="p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="relative flex-1 max-w-lg">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Buscar por Nome, Telefone ou CPF/CNPJ..."
            value={searchTerm} onChange={e => handleSearch(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {searchResult === 'not_found' && <span className="text-red-500">Lead não encontrado</span>}
        {searchResult && searchResult !== 'not_found' && (
          <button onClick={() => setSearchResult(null)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
            Limpar <FaTimes className="inline ml-1" />
          </button>
        )}
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {renderColumns()}
      </div>

      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">Editar: {selectedLead.name}</h2>
              <button onClick={closeLeadModal} className="text-gray-500 hover:text-gray-800"><FaTimes size={24} /></button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-3 mb-4">
                {leadData.address && (
                  <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center">
                    <FaMapMarkerAlt className="mr-2" /> Maps
                  </a>
                )}
                {leadData.phone && (
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center">
                    <FaWhatsapp className="mr-2" /> WhatsApp
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input name="name" value={leadData.name} onChange={e => setLeadData(prev => ({...prev, name: e.target.value}))} placeholder="Nome" className="p-2 border rounded" />
                <input name="phone" value={leadData.phone} onChange={e => setLeadData(prev => ({...prev, phone: e.target.value}))} placeholder="Telefone" className="p-2 border rounded" />
                <input name="email" value={leadData.email} onChange={e => setLeadData(prev => ({...prev, email: e.target.value}))} placeholder="Email" className="p-2 border rounded" />
                <input name="document" value={leadData.document} onChange={e => setLeadData(prev => ({...prev, document: e.target.value}))} placeholder="CPF/CNPJ" className="p-2 border rounded" />
                <input name="address" value={leadData.address} onChange={e => setLeadData(prev => ({...prev, address: e.target.value}))} placeholder="Endereço" className="col-span-2 p-2 border rounded" />
                <select name="status" value={leadData.status} onChange={e => setLeadData(prev => ({...prev, status: e.target.value}))} className="p-2 border rounded col-span-2">
                  {Object.keys(STAGES).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nova Nota</h3>
                <div className="flex gap-2">
                  <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Escreva uma nota..." className="flex-1 p-2 border rounded" rows="2" />
                  <button onClick={() => {
                    if (newNoteText.trim()) {
                      setLeadData(prev => ({ ...prev, notes: [...prev.notes, { text: newNoteText.trim(), timestamp: Date.now() }] }));
                      setNewNoteText('');
                    }
                  }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"><FaPlus /></button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeLeadModal} className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-100">Cancelar</button>
                <button onClick={saveLeadChanges} disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2">
                  <FaSave /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;