// src/components/reports/ReportsDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { FaCalendarAlt, FaUser, FaChartBar, FaClock, FaCheckCircle, FaTimesCircle, FaFileExcel, FaFilter } from 'react-icons/fa';
import { format, differenceInMinutes } from 'date-fns';

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

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const created = new Date(lead.created_at);
      const inDateRange = (!dateFrom || created >= new Date(dateFrom)) && (!dateTo || created <= new Date(dateTo + 'T23:59:59'));
      const bySeller = selectedSeller === 'all' || lead.seller_id === selectedSeller;
      return inDateRange && bySeller;
    });
  }, [leads, dateFrom, dateTo, selectedSeller]);

  // === MÉTRICAS ===
  const newLeads = filteredLeads.filter(l => l.status === 'Novo').length;

  const avgResponseTime = useMemo(() => {
    const withNotes = filteredLeads.filter(l => l.notes && l.notes.length > 1);
    const times = withNotes.map(lead => {
      const sorted = [...lead.notes].sort((a, b) => a.timestamp - b.timestamp);
      return differenceInMinutes(new Date(sorted[1].timestamp), new Date(sorted[0].timestamp));
    });
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  }, [filteredLeads]);

  const won = filteredLeads.filter(l => l.status === 'Ganho').length;
  const lost = filteredLeads.filter(l => l.status === 'Perdido').length;
  const conversionRate = won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(1) : 0;

  const exportToExcel = () => {
    const csv = [
      ['Nome', 'Status', 'Vendedor', 'Criado em', 'Última Nota'],
      ...filteredLeads.map(l => [
        l.name,
        l.status,
        l.seller_name || 'Sem Vendedor',
        format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
        l.notes?.length > 0 ? l.notes[l.notes.length - 1].text : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartBar /> Relatórios
        </h1>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <FaFileExcel /> Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaFilter /> Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-2 border rounded" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-2 border rounded" />
          <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)} className="p-2 border rounded">
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-6 rounded-lg text-center">
          <FaCalendarAlt className="text-3xl text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold">Novos Leads</h3>
          <p className="text-2xl font-bold text-blue-700">{newLeads}</p>
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
          <FaUser className="text-3xl text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold">Leads Ativos</h3>
          <p className="text-2xl font-bold text-purple-700">{filteredLeads.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;