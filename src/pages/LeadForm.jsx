// src/pages/LeadForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaMapMarkerAlt, FaWhatsapp, FaUserTie } from 'react-icons/fa';
import api from '../services/api.js';
import { useAuth } from '../AuthContext.jsx';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isEditMode = !!id;

  // LÓGICA PERFEITA: transferência SÓ na Lista de Leads
  const isFromList = location.state?.fromList || location.pathname.includes('/leads/') || location.pathname.includes('/register-lead/');
  const showTransfer = isEditMode && isFromList && user?.role === 'Admin';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    document: '',
    address: '',
    status: 'Novo',
    origin: 'Orgânico',
    uc: '',
    avg_consumption: '',
    estimated_savings: '',
    qsa: '',
    owner_id: user?.id || user?._id || '',
    notes: []
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(isEditMode);

  // Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // CARREGA LEAD + VENDEDORES (SÓ QUANDO NECESSÁRIO)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Carrega o lead
        if (isEditMode) {
          const leadRes = await api.get(`/leads/${id}`);
          let lead = leadRes.data || {};

          // Corrige owner_id quebrado
          if (!lead.owner_id || lead.owner_id === 'desconhecido' || lead.owner_id === 'null') {
            lead.owner_id = '';
          }

          const normalized = {
            ...lead,
            name: lead.name || '',
            phone: lead.phone || '',
            email: lead.email || '',
            document: lead.document || '',
            address: lead.address || '',
            status: lead.status || 'Novo',
            origin: lead.origin || 'Orgânico',
            uc: lead.uc || '',
            avg_consumption: lead.avgConsumption || lead.avg_consumption || '',
            estimated_savings: lead.estimatedSavings || lead.estimated_savings || '',
            qsa: lead.qsa || '',
            owner_id: lead.owner_id || '',
            notes: Array.isArray(lead.notes)
              ? lead.notes
              : (typeof lead.notes === 'string' ? JSON.parse(lead.notes || '[]').catch(() => []) : [])
          };

          setFormData(normalized);
        }

        // 2. Carrega vendedores SÓ se for Admin e vier da Lista
        if (showTransfer) {
          try {
            const res = await api.get('/users');
            let raw = res.data;

            let usersArray = [];
            if (Array.isArray(raw)) usersArray = raw;
            else if (raw?.users) usersArray = raw.users;
            else if (raw?.data) usersArray = raw.data;
            else if (typeof raw === 'string') {
              try { usersArray = JSON.parse(raw); } catch {}
            }

            const sellers = (Array.isArray(usersArray) ? usersArray : [])
              .filter(u => u && u.role !== 'Admin' && u._id)
              .map(u => ({
                _id: u._id,
                name: u.name || 'Sem Nome',
                email: u.email || 'sem@email.com'
              }));

            setUsers(sellers);
          } catch (err) {
            console.error('Erro ao carregar vendedores:', err);
            setToast({ message: 'Erro ao carregar vendedores', type: 'error' });
          }
        }
      } catch (err) {
        console.error('Erro ao carregar lead:', err);
        setToast({ message: 'Lead não encontrado', type: 'error' });
        setTimeout(() => navigate('/leads'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, showTransfer, user, navigate]);

  // Atualiza owner_id no cadastro novo
  useEffect(() => {
    if (!isEditMode && (user?.id || user?._id)) {
      setFormData(prev => ({
        ...prev,
        owner_id: user.id || user._id || ''
      }));
    }
  }, [user, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    const cleanPhone = formData.phone?.replace(/\D/g, '') || '';
    if (!cleanPhone) newErrors.phone = 'Telefone é obrigatório';
    else if (cleanPhone.length < 10 || cleanPhone.length > 11) newErrors.phone = 'Telefone inválido';
    if (!formData.status) newErrors.status = 'Status é obrigatório';
    if (!formData.origin) newErrors.origin = 'Origem é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      email: formData.email?.trim() || null,
      document: formData.document?.trim() || null,
      address: formData.address?.trim() || null,
      status: formData.status,
      origin: formData.origin,
      uc: formData.uc?.trim() || null,
      avg_consumption: formData.avg_consumption ? parseFloat(formData.avg_consumption) : null,
      estimated_savings: formData.estimated_savings ? parseFloat(formData.estimated_savings) : null,
      qsa: formData.qsa?.trim() || null,
    };

    // FORÇA TRANSFERÊNCIA CORRETA
    if (showTransfer && formData.owner_id && formData.owner_id !== 'desconhecido') {
      payload.owner_id = formData.owner_id;
    }

    if (newNote.trim()) {
      payload.newNote = {
        text: newNote.trim(),
        timestamp: Date.now(),
        user: user?.name || 'Usuário'
      };
    } else if (!isEditMode) {
      payload.newNote = {
        text: `Lead criado via formulário (Origem: ${formData.origin})`,
        timestamp: Date.now(),
        user: user?.name || 'Sistema'
      };
    }

    try {
      if (isEditMode) {
        await api.put(`/leads/${id}`, payload);
        setToast({ message: 'Lead atualizado e transferido com sucesso!', type: 'success' });
      } else {
        await api.post('/leads', payload);
        setToast({ message: 'Lead criado com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/leads'), 1500);
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao salvar';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
      setNewNote('');
    }
  };

  // Links
  const getGoogleMapsLink = () => formData.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}` : null;
  const getWhatsAppLink = () => {
    if (!formData.phone) return null;
    const phone = formData.phone.replace(/\D/g, '');
    const formatted = phone.startsWith('55') ? phone : `55${phone}`;
    const msg = encodeURIComponent(`Olá ${formData.name}, tudo bem? Estamos entrando em contato sobre sua proposta de energia solar.`);
    return `https://web.whatsapp.com/send?phone=${formatted}&text=${msg}`;
  };

  const formatNoteDate = (ts) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(ts));
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-5xl font-black text-indigo-600 animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-6 rounded-2xl shadow-2xl text-white font-bold text-xl animate-bounce ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-6 text-3xl">×</button>
        </div>
      )}

      <div className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="mr-6 p-4 bg-white rounded-full shadow-2xl hover:scale-110 transition">
          <FaArrowLeft size={36} className="text-indigo-600" />
        </button>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          {isEditMode ? `Editar Lead: ${formData.name}` : 'Novo Lead'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-3xl p-12">

        {/* TRANSFERÊNCIA SÓ NA LISTA */}
        {showTransfer && (
          <div className="mb-12 bg-gradient-to-r from-amber-100 to-orange-100 border-4 border-amber-500 rounded-3xl p-10">
            <label className="flex items-center gap-4 text-3xl font-bold text-amber-900 mb-6">
              <FaUserTie size={48} /> Transferir Lead para:
            </label>
            <select
              value={formData.owner_id || ''}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
              className="w-full p-6 border-4 border-amber-600 rounded-2xl text-xl font-bold bg-white shadow-inner"
            >
              <option value="">Selecione um vendedor</option>
              {users.length === 0 ? (
                <option disabled>Carregando...</option>
              ) : (
                users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* TODOS OS CAMPOS — 100% COMPLETOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Mercado Lead" className={`w-full p-4 border-2 rounded-xl text-lg transition ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'}`} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone <span className="text-red-500">*</span></label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="45 999000000" className={`w-full p-4 border-2 rounded-xl text-lg transition ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'}`} />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contato@exemplo.com" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">CPF/CNPJ</label><input type="text" name="document" value={formData.document} onChange={handleChange} placeholder="00000000000000" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Endereço</label><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Rua Exemplo, 123" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500">
              <option value="Novo">Novo</option><option value="Primeiro Contato">Primeiro Contato</option><option value="Retorno Agendado">Retorno Agendado</option><option value="Em Negociação">Em Negociação</option><option value="Proposta Enviada">Proposta Enviada</option><option value="Ganho">Ganho</option><option value="Perdido">Perdido</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Origem <span className="text-red-500">*</span></label>
            <select name="origin" value={formData.origin} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500">
              <option value="Orgânico">Orgânico</option><option value="Indicado">Indicado</option><option value="Facebook">Facebook</option><option value="Google">Google</option><option value="Instagram">Instagram</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">UC</label><input type="text" name="uc" value={formData.uc} onChange={handleChange} placeholder="00000000" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Consumo Médio (kWh)</label><input type="number" step="0.01" name="avg_consumption" value={formData.avg_consumption} onChange={handleChange} placeholder="1250.00" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Economia Estimada (R$)</label><input type="number" step="0.01" name="estimated_savings" value={formData.estimated_savings} onChange={handleChange} placeholder="850.00" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">QSA</label><textarea name="qsa" value={formData.qsa} onChange={handleChange} rows="3" placeholder="Sócios..." className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg resize-none" /></div>
        </div>

        {/* Notas, WhatsApp, Maps, Botões — TUDO IGUAL */}
        {isEditMode && (
          <div className="mt-12 bg-gradient-to-b from-gray-50 to-gray-100 p-10 rounded-3xl border-4 border-indigo-200">
            <h3 className="text-3xl font-black mb-8 text-indigo-900">Histórico de Interações</h3>
            <div className="space-y-6 max-h-96 overflow-y-auto mb-8">
              {formData.notes.length === 0 ? (
                <p className="text-center text-gray-500 italic text-xl py-10">Nenhuma interação ainda</p>
              ) : (
                formData.notes.map((n, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-xl border-l-8 border-green-500">
                    <p className="text-lg font-semibold">{n.text}</p>
                    <p className="text-sm text-gray-600 mt-2">{n.user || 'Sistema'} - {formatNoteDate(n.timestamp)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-4">
              <input value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e))} placeholder="Nova nota..." className="flex-1 p-6 border-4 border-indigo-300 rounded-2xl text-xl" />
              <button type="button" onClick={handleSubmit} className="px-12 py-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-2xl">Adicionar</button>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-8">
          {formData.address && <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-red-600 text-white rounded-3xl font-bold hover:bg-red-700 flex items-center gap-4 shadow-2xl transform hover:scale-110 transition"><FaMapMarkerAlt size={36} /> Google Maps</a>}
          {formData.phone && <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-green-600 text-white rounded-3xl font-bold hover:bg-green-700 flex items-center gap-4 shadow-2xl transform hover:scale-110 transition"><FaWhatsapp size={36} /> WhatsApp</a>}
        </div>

        <div className="mt-16 flex justify-end gap-8">
          <button type="button" onClick={() => navigate(-1)} className="px-16 py-8 border-8 border-gray-400 rounded-3xl font-black text-4xl hover:bg-gray-100 transition">Cancelar</button>
          <button type="submit" disabled={saving} className="px-24 py-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-black text-4xl shadow-3xl disabled:opacity-50 transform hover:scale-110 transition flex items-center gap-6">
            <FaSave size={48} />
            {saving ? 'SALVANDO...' : isEditMode ? 'ATUALIZAR LEAD' : 'CRIAR LEAD'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;