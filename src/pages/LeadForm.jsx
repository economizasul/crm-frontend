// src/pages/LeadForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../services/api.js';
import { useAuth } from '../AuthContext.jsx';

const LeadForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    owner_id: user?.id || user?._id || '', // FORÇA O DONO LOGADO
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Atualiza owner_id quando user carregar
  useEffect(() => {
    if (user?.id || user?._id) {
      setFormData(prev => ({
        ...prev,
        owner_id: user.id || user._id || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    const cleanPhone = formData.phone?.replace(/\D/g, '') || '';
    if (!cleanPhone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    if (!formData.origin?.trim()) {
      newErrors.origin = 'Origem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setToast(null);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ''), // apenas números
      email: formData.email?.trim() || null,
      document: formData.document?.trim() || null,
      address: formData.address?.trim() || null,
      status: formData.status,
      origin: formData.origin,
      uc: formData.uc?.trim() || null,
      avg_consumption: formData.avg_consumption ? parseFloat(formData.avg_consumption) : null,
      estimated_savings: formData.estimated_savings ? parseFloat(formData.estimated_savings) : null,
      qsa: formData.qsa?.trim() || null,
      owner_id: user?.id || user?._id || null, // OBRIGATÓRIO
      notes: JSON.stringify([{ 
        text: `Lead criado via formulário (Origem: ${formData.origin})`, 
        timestamp: Date.now() 
      }])
    };

    console.log('ENVIANDO LEAD PARA O BACKEND:', payload);

    try {
      await api.post('/leads', payload);

      setToast({ message: 'Lead cadastrado com sucesso!', type: 'success' });
      
      setTimeout(() => {
        navigate('/leads');
      }, 1500);

    } catch (error) {
      console.error('ERRO DO BACKEND:', error.response?.data);
      const msg = error.response?.data?.error || 
                  error.response?.data?.message || 
                  'Erro ao cadastrar lead. Tente novamente.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl text-white font-bold transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-4 font-bold">×</button>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-3 bg-white rounded-full shadow hover:shadow-lg transition"
        >
          <FaArrowLeft size={24} className="text-indigo-600" />
        </button>
        <h1 className="text-4xl font-bold text-gray-800">Cadastrar Novo Lead</h1>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Supermercado Mai"
              className={`w-full p-4 border-2 rounded-xl text-lg transition ${
                errors.name ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="41995606080"
              className={`w-full p-4 border-2 rounded-xl text-lg transition ${
                errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contato@exemplo.com"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500"
            />
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CPF/CNPJ</label>
            <input
              type="text"
              name="document"
              value={formData.document}
              onChange={handleChange}
              placeholder="12403493000190"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500"
            />
          </div>

          {/* Endereço */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Endereço</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Rua Exemplo, 123 - Centro"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500"
            >
              <option value="Novo">Novo</option>
              <option value="Pimeiro Contato">Primeiro Contato</option>
              <option value="Retorno Agendado">Retorno Agendado</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Proposta Enviada">Proposta Enviada</option>
              <option value="Ganho">Ganho</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>

          {/* Origem */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Origem <span className="text-red-500">*</span>
            </label>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:border-indigo-500"
            >
              <option value="Orgânico">Orgânico</option>
              <option value="Indicado">Indicado</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
              <option value="Instagram">Instagram</option>
            </select>
            {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
          </div>

          {/* UC */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">UC</label>
            <input
              type="text"
              name="uc"
              value={formData.uc}
              onChange={handleChange}
              placeholder="27794270"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg"
            />
          </div>

          {/* Consumo Médio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Consumo Médio (kWh)</label>
            <input
              type="number"
              step="0.01"
              name="avg_consumption"
              value={formData.avg_consumption}
              onChange={handleChange}
              placeholder="1250.00"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg"
            />
          </div>

          {/* Economia Estimada */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Economia Estimada (R$)</label>
            <input
              type="number"
              step="0.01"
              name="estimated_savings"
              value={formData.estimated_savings}
              onChange={handleChange}
              placeholder="850.00"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg"
            />
          </div>

          {/* QSA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">QSA</label>
            <textarea
              name="qsa"
              value={formData.qsa}
              onChange={handleChange}
              rows="3"
              placeholder="Sócios: João Silva, Maria Oliveira"
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg resize-none"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="mt-12 flex justify-end gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <FaSave size={24} />
            {saving ? 'Salvando Lead...' : 'Salvar Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;