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
    lat: null,
    lng: null,
    owner_id: user?.id || user?._id // CRÍTICO: ID do vendedor logado
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // remove tudo que não é número
        avg_consumption: formData.avg_consumption ? parseFloat(formData.avg_consumption) : null,
        estimated_savings: formData.estimated_savings ? parseFloat(formData.estimated_savings) : null,
        owner_id: user?.id || user?._id, // FORÇA O DONO
        status: formData.status || 'Novo',
        origin: formData.origin || 'Orgânico'
      };

      console.log('ENVIANDO PARA O BACKEND:', payload); // DEBUG

      await api.post('/leads', payload);

      setToast({ message: 'Lead cadastrado com sucesso!', type: 'success' });
      setTimeout(() => navigate('/leads'), 1500);
    } catch (error) {
      console.error('Erro ao salvar lead:', error.response?.data);
      const msg = error.response?.data?.error || 'Erro ao cadastrar lead';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg text-white font-bold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} shadow-lg z-50`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 text-indigo-600 hover:text-indigo-800">
          <FaArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Cadastrar Novo Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="41995606080"
              className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Documento (CPF/CNPJ)</label>
            <input
              type="text"
              name="document"
              value={formData.document}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origem *</label>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="Orgânico">Orgânico</option>
              <option value="Indicado">Indicado</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          <div>
            <label>UC</label>
            <input type="text" name="uc" value={formData.uc} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label>Consumo Médio (kWh)</label>
            <input type="number" step="0.01" name="avg_consumption" value={formData.avg_consumption} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label>Economia Estimada (R$)</label>
            <input type="number" step="0.01" name="estimated_savings" value={formData.estimated_savings} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label>QSA</label>
            <textarea name="qsa" value={formData.qsa} onChange={handleChange} rows="2" className="w-full p-3 border rounded-lg"></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
          >
            <FaSave /> {saving ? 'Salvando...' : 'Salvar Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;