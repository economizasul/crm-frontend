// src/components/ReportsDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { FaCalendarAlt, FaUser, FaChartBar, FaClock, FaCheckCircle, FaTimesCircle, FaFileAlt, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const ReportsDashboard = () => {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('all');

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, sellersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/leads`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/v1/reports/sellers`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setLeads(leadsRes.data);
        setSellers([{ id: 'all', name: 'Todos os Vendedores' }, ...sellersRes.data]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Filtrar leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const created = new Date(lead.created_at);
      const inDateRange = (!dateFrom || created >= new Date(dateFrom)) && (!dateTo || created <= new Date(dateTo + 'T23:59:59'));
      const bySeller = selectedSeller === 'all' || lead.seller_id === selectedSeller;
      return inDateRange && bySeller;
    });
  }, [leads, dateFrom, dateTo, selectedSeller]);

  // == RELATÓRIOS ==
  const newLeadsCount = filteredLeads.filter(l => l.status === 'Novo').length;

  const avgResponseTime = useMemo(() => {
    const withNotes = filteredLeads.filter(l => l.notes && Array.isArray(l.notes) && l.notes.length > 1);
    const times = withNotes.map(lead => {
      const sorted = [...lead.notes].sort((a, b) => a.timestamp - b.timestamp);
      return sorted[1].timestamp - sorted[0].timestamp;
    }).filter(t => t > 0);
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60000) : 0;
  }, [filteredLeads]);

  const won = filteredLeads.filter(l => l.status === 'Ganho').length;
  const lost = filteredLeads.filter(l => l.status === 'Perdido').length;
  const conversionRate = won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(1) : 0;

  const formatDate = (date) => format(new Date(date), 'dd/MM HH:mm');

  if (loading) return <div className="p-8 text-center">Carregando relatórios...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <FaChartBar /> Relatórios do CRM
      </h1>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaFilter /> Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)} className="w-full p-2 border rounded-lg">
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-6 rounded-lg text-center">
          <FaCalendarAlt className="text-3xl text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold">Novos Leads</h3>
          <p className="text-2xl font-bold text-blue-700">{newLeadsCount}</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg text-center">
          <FaClock className="text-3xl text-yellow-600 mx-auto mb-2" />
          <h3 className="font-semibold">Tempo Médio Resposta</h3>
          <p className="text-2xl font-bold text-yellow-700">{avgResponseTime} min</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg text-center">
          <FaCheckCircle className="text-3xl text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold">Taxa de Conversão</h3>
          <p className="text-2xl font-bold text-green-700">{conversionRate}%</p>
        </div>
        <div className="bg-purple-100 p-6 rounded-lg text-center">
          <FaFileAlt className="text-3xl text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold">Leads com Notas</h3>
          <p className="text-2xl font-bold text-purple-700">
            {filteredLeads.filter(l => l.notes?.length > 0).length}
          </p>
        </div>
      </div>

      {/* Relatórios Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Conversão</h3>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <FaCheckCircle className="text-5xl text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{won}</p>
              <p className="text-sm text-gray-600">Ganho</p>
            </div>
            <div className="text-center">
              <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{lost}</p>
              <p className="text-sm text-gray-600">Perdido</p>
            </div>
          </div>
          <p className="text-center mt-4 text-lg font-semibold">
            Taxa: <span className="text-green-600">{conversionRate}%</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Últimas Notas</h3>
          <div className="max-h-48 overflow-y-auto text-sm">
            {filteredLeads.filter(l => l.notes?.length > 0).slice(0, 5).map(lead => (
              <div key={lead.id} className="border-b pb-2 mb-2">
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(lead.notes[lead.notes.length - 1].timestamp)}
                </p>
              </div>
            ))}
            {filteredLeads.filter(l => l.notes?.length > 0).length === 0 && (
              <p className="text-gray-500 text-center">Nenhuma nota</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;