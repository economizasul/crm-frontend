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

  // Detecta se veio da Lista ou do Kanban
  const cameFromList = location.state?.fromList || 
                       location.pathname.includes('/register-lead/') || 
                       location.pathname.includes('/leads/');

  const cameFromKanban = location.pathname.includes('/kanban') || 
                         location.state?.fromKanban;

  // Só mostra transferência se for Admin + edição + veio da Lista
  const showTransfer = isEditMode && cameFromList && !cameFromKanban && user?.role === 'Admin';

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
    owner_id: user?._id || '',
    notes: []
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [errors, setErrors] = useState({});

  // Toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Carrega lead + vendedores
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (isEditMode) {
          const { data } = await api.get(`/leads/${id}`);
          
          // Corrige owner_id quebrado
          if (!data.owner_id || data.owner_id === 'desconhecido') {
            data.owner_id = '';
          }

          setFormData({
            ...data,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            document: data.document || '',
            address: data.address || '',
            status: data.status || 'Novo',
            origin: data.origin || 'Orgânico',
            uc: data.uc || '',
            avg_consumption: data.avg_consumption || data.avgConsumption || '',
            estimated_savings: data.estimated_savings || data.estimatedSavings || '',
            qsa: data.qsa || '',
            owner_id: data.owner_id || '',
            notes: Array.isArray(data.notes) 
              ? data.notes 
              : (typeof data.notes === 'string' ? JSON.parse(data.notes).catch(() => []) : [])
          });
        }

        // Carrega vendedores SÓ se precisar mostrar transferência
        if (showTransfer) {
          try {
            const { data } = await api.get('/users');
            let list = [];

            if (Array.isArray(data)) list = data;
            else if (data?.users) list = data.users;
            else if (data?.data) list = data.data;

            const sellers = list
              .filter(u => u.role !== 'Admin' && u._id)
              .map(u => ({
                _id: u._id,
                name: u.name || 'Sem Nome',
                email: u.email || 'sem@email.com'
              }));

            setUsers(sellers);
          } catch (err) {
            console.error('Erro ao carregar vendedores:', err);
          }
        }
      } catch (err) {
        setToast({ message: 'Erro ao carregar lead', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, showTransfer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Nome obrigatório';
    const phone = formData.phone.replace(/\D/g, '');
    if (phone.length < 10) err.phone = 'Telefone inválido';
    if (!formData.status) err.status = 'Status obrigatório';
    if (!formData.origin) err.origin = 'Origem obrigatória';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      email: formData.email.trim() || null,
      document: formData.document.trim() || null,
      address: formData.address.trim() || null,
      status: formData.status,
      origin: formData.origin,
      uc: formData.uc.trim() || null,
      avg_consumption: formData.avg_consumption ? Number(formData.avg_consumption) : null,
      estimated_savings: formData.estimated_savings ? Number(formData.estimated_savings) : null,
      qsa: formData.qsa.trim() || null,
    };

    // APLICA TRANSFERÊNCIA CORRETAMENTE
    if (showTransfer && formData.owner_id) {
      payload.owner_id = formData.owner_id;
    }

    // Adiciona nota
    if (newNote.trim()) {
      payload.newNote = {
        text: newNote.trim(),
        timestamp: Date.now(),
        user: user.name || 'Usuário'
      };
    }

    try {
      if (isEditMode) {
        await api.put(`/leads/${id}`, payload);
        setToast({ message: 'Lead atualizado com sucesso!', type: 'success' });
      } else {
        await api.post('/leads', payload);
        setToast({ message: 'Lead criado com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/leads'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Erro ao salvar', type: 'error' });
    } finally {
      setSaving(false);
      setNewNote('');
    }
  };

  const getWhatsAppLink = () => {
    if (!formData.phone) return '#';
    const phone = formData.phone.replace(/\D/g, '');
    const num = phone.startsWith('55') ? phone : `55${phone}`;
    const msg = encodeURIComponent(`Olá ${formData.name}, tudo bem?`);
    return `https://web.whatsapp.com/send?phone=${num}&text=${msg}`;
  };

  const getMapsLink = () => formData.address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}` 
    : '#';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-4xl font-bold text-indigo-600 animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-6 rounded-xl shadow-2xl text-white font-bold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-bounce`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-4 text-2xl">×</button>
        </div>
      )}

      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-6 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition">
          <FaArrowLeft size={32} className="text-indigo-600" />
        </button>
        <h1 className="text-5xl font-black text-indigo-600">
          {isEditMode ? `Editar: ${formData.name}` : 'Novo Lead'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-10">

        {/* TRANSFERÊNCIA - SÓ NA LISTA */}
        {showTransfer && (
          <div className="mb-10 p-8 bg-orange-50 border-4 border-orange-500 rounded-2xl">
            <label className="flex items-center gap-4 text-2xl font-bold text-orange-900 mb-4">
              <FaUserTie size={40} /> Transferir Lead para:
            </label>
            <select
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
              className="w-full p-5 border-4 border-orange-600 rounded-xl text-lg font-semibold bg-white"
            >
              <option value="">Selecione um vendedor</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <label className="block font-bold mb-2">Nome *</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" placeholder="Nome completo" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <label className="block font-bold mb-2">Telefone *</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" placeholder="45999999999" />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          <div><label className="block font-bold mb-2">Email</label><input name="email" value={formData.email} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" /></div>
          <div><label className="block font-bold mb-2">CPF/CNPJ</label><input name="document" value={formData.document} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" /></div>
          <div className="md:col-span-2"><label className="block font-bold mb-2">Endereço</label><input name="address" value={formData.address} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" /></div>
          <div><label className="block font-bold mb-2">Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 border-2 rounded-xl">
              <option value="Novo">Novo</option>
              <option value="Primeiro Contato">Primeiro Contato</option>
              <option value="Retorno Agendado">Retorno Agendado</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Proposta Enviada">Proposta Enviada</option>
              <option value="Ganho">Ganho</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>
          <div><label className="block font-bold mb-2">Origem *</label>
            <select name="origin" value={formData.origin} onChange={handleChange} className="w-full p-4 border-2 rounded-xl">
              <option value="Orgânico">Orgânico</option>
              <option value="Indicado">Indicado</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>
          <div><label className="block font-bold mb-2">UC</label><input name="uc" value={formData.uc} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" /></div>
          <div><label className="block font-bold mb-2">Consumo Médio (kWh)</label><input name="avg_consumption" value={formData.avg_consumption} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" /></div>
          <div><label className="block font-bold mb-2">Economia Estimada (R$)</label><input name="estimated_savings" value={formData.estimated_savings} onChange={handleChange} className="w-full p-4 border-2 rounded-xl" /></div>
          <div><label className="block font-bold mb-2">QSA</label><textarea name="qsa" value={formData.qsa} onChange={handleChange} rows="3" className="w-full p-4 border-2 rounded-xl resize-none" /></div>
        </div>

        {isEditMode && (
          <div className="mb-10 p-8 bg-gray-100 rounded-2xl">
            <h3 className="text-2xl font-bold mb-6">Histórico</h3>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {formData.notes.length === 0 ? <p className="text-gray-500 italic">Nenhuma nota</p> : formData.notes.map((n, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold">{n.text}</p>
                  <p className="text-sm text-gray-600">{n.user} - {new Date(n.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)} placeholder="Nova nota..." className="flex-1 p-4 border-2 rounded-xl" />
              <button type="button" onClick={handleSubmit} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Add</button>
            </div>
          </div>
        )}

        <div className="flex gap-6 mb-10">
          {formData.address && <a href={getMapsLink()} target="_blank" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold flex items-center gap-3 hover:bg-red-700"><FaMapMarkerAlt /> Maps</a>}
          {formData.phone && <a href={getWhatsAppLink()} target="_blank" className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold flex items-center gap-3 hover:bg-green-700"><FaWhatsapp /> WhatsApp</a>}
        </div>

        <div className="flex justify-end gap-6">
          <button type="button" onClick={() => navigate(-1)} className="px-12 py-5 border-4 border-gray-400 rounded-xl font-black text-2xl hover:bg-gray-100">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="px-16 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-2xl flex items-center gap-4 disabled:opacity-50">
            <FaSave size={36} />
            {saving ? 'SALVANDO...' : isEditMode ? 'ATUALIZAR' : 'CRIAR'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;