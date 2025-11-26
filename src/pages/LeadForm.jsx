// src/pages/LeadForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaMapMarkerAlt, FaWhatsapp, FaUserTie } from 'react-icons/fa';
import api from '../services/api.js';
import { useAuth } from '../AuthContext.jsx';

function normalizeAddressForNominatim(addr) {
  if (!addr) return addr;

  let normalized = addr;
  normalized = normalized.replace(/\bPR\b/gi, "Paraná");

  if (!/Brasil/i.test(normalized)) {
    normalized += ", Brasil";
  }

  return normalized;
}

async function fetchCoordinatesFromAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "pt-BR",
        "User-Agent": "economizasul-crm/1.0 (contato@seudominio.com)"
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      const item = data[0];
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),

        cidade:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.municipality ||
          item.address?.county ||
          null,

        regiao:
          item.address?.state ||
          item.address?.region ||
          item.address?.state_district ||
          null,

        raw: item
      };
    }

    return null;
  } catch (err) {
    console.error("Erro ao buscar coordenadas:", err);
    return null;
  }
}

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    document: '',
    address: '',
    lat: null,
    lng: null,
    google_maps_link: '',
    status: 'Novo',
    origin: 'Orgânico',
    uc: '',
    avg_consumption: '',
    estimated_savings: '',
    qsa: '',
    owner_id: '',
    notes: []
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const loadAllData = async () => {
      if (!isEditMode && !user) return;

      try {
        setLoading(true);

        if (isEditMode) {
          const leadRes = await api.get(`/leads/${id}`);
          let lead = leadRes.data || {};

          const normalizedLead = {
            ...lead,
            name: lead.name || '',
            phone: lead.phone || '',
            email: lead.email || '',
            document: lead.document || '',
            address: lead.address || '',
            status: lead.status || 'Novo',
            origin: lead.origin || 'Orgânico',
            uc: lead.uc || '',
            avg_consumption: lead.avg_consumption || lead.avgConsumption || '',
            estimated_savings: lead.estimated_savings || lead.estimatedSavings || '',
            qsa: lead.qsa || '',
            owner_id: lead.owner_id || lead.ownerId || lead.owner?.id || '',
            notes: Array.isArray(lead.notes) 
              ? lead.notes 
              : (typeof lead.notes === 'string' ? JSON.parse(lead.notes).catch(() => []) : [])
          };
          setFormData(normalizedLead);
        }

        if (user?.role === 'Admin') {
          try {
            const usersRes = await api.get('/users');
            let raw = usersRes.data;

            let usersArray = [];
            if (Array.isArray(raw)) usersArray = raw;
            else if (raw?.users) usersArray = raw.users;
            else if (raw?.data) usersArray = raw.data;

            const allUsers = usersArray
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
        }
      } catch (err) {
        setToast({ message: 'Erro ao carregar dados', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id, isEditMode, user]);

  useEffect(() => {
    if (!isEditMode && user) {
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
    else if (cleanPhone.length < 10) newErrors.phone = 'Telefone inválido';
    if (!formData.status) newErrors.status = 'Status é obrigatório';
    if (!formData.origin) newErrors.origin = 'Origem é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = async (value) => {
    setFormData(prev => ({ ...prev, address: value }));

    if (!value) return;

    try {
      const normalized = normalizeAddressForNominatim(value);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(normalized)}`,
        { headers: { "User-Agent": "economizasul-crm/1.0" } }
      );

      const data = await res.json();

      if (data && data.length > 0) {
        const addr = data[0].address || {};

        setFormData(prev => ({
          ...prev,
          cidade: prev.cidade || 
            addr.city || addr.town || addr.village || addr.municipality || addr.county || "",

          regiao: prev.regiao ||
            addr.state || addr.region || addr.state_district || ""
        }));
      }
    } catch (err) {
      console.error("Erro ao geocodificar endereço:", err);
    }
  };


// --- INÍCIO handleSubmit ---
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setSaving(true);

  try {
    // 1) Tenta geocodificar se houver endereço (não é obrigatório)
    let coords = null;
    if (formData.address && formData.address.trim() !== "") {
      try {
        const normalizedAddress = normalizeAddressForNominatim(formData.address);
        coords = await fetchCoordinatesFromAddress(normalizedAddress);
      } catch (geoErr) {
        console.warn("Geocoding falhou (não é bloqueante):", geoErr);
        coords = null;
      }
    }

    // 2) Monta payload de forma clara (não depende de setFormData)
    const payload = {
      name: formData.name?.trim() || null,
      phone: formData.phone ? formData.phone.replace(/\D/g, '') : null,
      email: formData.email?.trim() || null,
      document: formData.document?.trim() || null,
      address: formData.address?.trim() || null,
      status: formData.status || "Novo",
      origin: formData.origin || "Orgânico",
      uc: formData.uc?.trim() || null,
      avg_consumption: formData.avg_consumption ? parseFloat(formData.avg_consumption) : null,
      estimated_savings: formData.estimated_savings ? parseFloat(formData.estimated_savings) : null,
      qsa: formData.qsa?.trim() || null,
      // prioridade: coords -> formData -> null
      lat: (coords && coords.lat != null) ? coords.lat : (formData.lat ?? null),
      lng: (coords && coords.lng != null) ? coords.lng : (formData.lng ?? null),
      cidade: (coords && typeof coords.cidade === 'string' && coords.cidade.trim() !== '') ? coords.cidade : (formData.cidade ?? null),
      regiao: (coords && typeof coords.regiao === 'string' && coords.regiao.trim() !== '') ? coords.regiao : (formData.regiao ?? null),
      google_maps_link: (coords && coords.lat && coords.lng) ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : (formData.google_maps_link || null)
    };

    // owner_id
    if (formData.owner_id && formData.owner_id !== '') payload.owner_id = parseInt(formData.owner_id, 10);

    // newNote
    if (newNote?.trim()) {
      payload.newNote = { text: newNote.trim(), timestamp: Date.now(), user: user?.name || 'Usuário' };
    } else if (!isEditMode) {
      payload.newNote = { text: `Lead criado via formulário (Origem: ${formData.origin})`, timestamp: Date.now(), user: user?.name || 'Sistema' };
    }

    // DEBUG - log payload (remover em produção)
    console.debug("-> Enviando payload:", payload);

    // 3) Envia (POST ou PUT)
    let response;
    if (isEditMode) {
      response = await api.put(`/leads/${id}`, payload);
    } else {
      response = await api.post('/leads', payload);
    }

    console.debug("-> Response:", response?.data ?? response);
    setToast({ message: isEditMode ? 'Lead atualizado com sucesso!' : 'Lead criado com sucesso!', type: 'success' });

    // Atualiza estado local com o que veio do server (se houver)
    if (response?.data) {
      const savedLead = response.data.lead || response.data || null;
      if (savedLead) {
        setFormData(prev => ({
          ...prev,
          lat: savedLead.lat ?? payload.lat,
          lng: savedLead.lng ?? payload.lng,
          google_maps_link: savedLead.google_maps_link ?? payload.google_maps_link,
          cidade: savedLead.cidade ?? payload.cidade,
          regiao: savedLead.regiao ?? payload.regiao
        }));
      }
    }

    setTimeout(() => navigate('/leads'), 800);
  } catch (err) {
    console.error("Erro ao salvar lead:", err);
    const serverMsg = err?.response?.data?.error || err?.response?.data || err.message;
    setToast({ message: serverMsg || 'Erro no servidor', type: 'error' });
  } finally {
    setSaving(false);
    setNewNote('');
  }
};
// --- FIM handleSubmit ---

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
      <div className="flex justify-center items-center h-screen">
        <div className="text-4xl font-bold text-indigo-600 animate-pulse">Carregando lead...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-6 rounded-2xl shadow-2xl text-white font-bold text-xl transition-all animate-bounce ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-6 text-3xl">×</button>
        </div>
      )}

      <div className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="mr-6 p-4 bg-white rounded-full shadow-2xl hover:scale-110 transition">
          <FaArrowLeft size={36} className="text-indigo-600" />
        </button>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          {isEditMode ? `Editar Lead: ${formData.name || 'Carregando...'}` : 'Novo Lead'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-3xl p-12">

        {/* TRANSFERÊNCIA */}
        {user?.role === 'Admin' && isEditMode && (
          <div className="mb-12 bg-gradient-to-r from-amber-100 to-orange-100 border-4 border-amber-500 rounded-3xl p-10">
            <label className="flex items-center gap-4 text-3xl font-bold text-amber-900 mb-6">
              <FaUserTie size={48} /> Transferir Lead para:
            </label>
            <select
              value={formData.owner_id || ''}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
              className="w-full p-6 border-4 border-amber-600 rounded-2xl text-xl font-bold bg-white shadow-inner"
            >
              <option value="">Selecione um usuário</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* RESTANTE DO FORMULÁRIO (SEM MUDANÇAS) */}
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
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contato@exemplo.com" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500" />
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">CPF/CNPJ</label>
            <input type="text" name="document" value={formData.document} onChange={handleChange} placeholder="00000000000000" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Endereço</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Rua Exemplo, 123" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500" />
            <input type="text" name="cidade" value={formData.cidade || ""} onChange={(e) => setFormData({...formData, cidade: e.target.value})} placeholder="Cidade" readOnly className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500 mt-2" />
            <input type="text" name="regiao" value={formData.regiao || ""}  onChange={(e) => setFormData({...formData, regiao: e.target.value})}  placeholder="Região" readOnly className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500 mt-2" />
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500">
              <option value="Novo">Novo</option>
              <option value="Contato">Contato</option>
              <option value="Rechame">Rechame</option>
              <option value="Retorno">Retorno</option>
              <option value="Conversando">Conversando</option>
              <option value="Simulação">Simulação</option>
              <option value="Ganho">Ganho</option>
              <option value="Perdido">Perdido</option>
              <option value="Inapto">Inapto</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Origem <span className="text-red-500">*</span></label>
            <select name="origin" value={formData.origin} onChange={handleChange} className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500">
              <option value="Orgânico">Orgânico</option>
              <option value="Indicado">Indicado</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">UC</label>
            <input type="text" name="uc" value={formData.uc} onChange={handleChange} placeholder="00000000" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg" />
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Consumo Médio (kWh)</label>
            <input type="number" step="0.01" name="avg_consumption" value={formData.avg_consumption} onChange={handleChange} placeholder="1250.00" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg" />
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Economia Estimada (R$)</label>
            <input type="number" step="0.01" name="estimated_savings" value={formData.estimated_savings} onChange={handleChange} placeholder="850.00" className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg" />
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">QSA</label>
            <textarea name="qsa" value={formData.qsa} onChange={handleChange} rows="3" placeholder="Sócios..." className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg resize-none" />
          </div>
        </div>

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
            <div className="flex gap-4 mb-8">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e))}
                placeholder="Nova nota... (Enter para salvar)"
                className="flex-1 p-6 border-4 border-indigo-300 rounded-2xl text-xl"
              />
              <button type="button" onClick={handleSubmit} className="px-12 py-6 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-2xl">
                Adicionar
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-8">
          {formData.address && (
            <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-red-600 text-white rounded-3xl font-bold hover:bg-red-700 flex items-center gap-4 shadow-2xl transform hover:scale-110 transition">
              <FaMapMarkerAlt size={36} /> Google Maps
            </a>
          )}
          {formData.phone && (
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-green-600 text-white rounded-3xl font-bold hover:bg-green-700 flex items-center gap-4 shadow-2xl transform hover:scale-110 transition">
              <FaWhatsapp size={36} /> WhatsApp
            </a>
          )}
        </div>

        <div className="mt-16 flex justify-end gap-8">
          <button type="button" onClick={() => navigate(-1)} className="px-16 py-8 border-8 border-gray-400 rounded-3xl font-black text-4xl hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-24 py-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-black text-4xl shadow-3xl disabled:opacity-50 transform hover:scale-110 transition flex items-center gap-6"
          >
            <FaSave size={48} />
            {saving ? 'SALVANDO...' : isEditMode ? 'ATUALIZAR LEAD' : 'CRIAR LEAD'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;