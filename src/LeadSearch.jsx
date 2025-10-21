import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadSearch = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';
  const API_URL = `${API_BASE_URL}/api/leads`;

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeads(res.data || []);
      } catch (e) {
        setError('Falha ao carregar leads');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated, token]);

  const results = useMemo(() => {
    const q = (query || '').toLowerCase();
    if (!q) return [];
    return (leads || []).filter((lead) => {
      return [
        lead.name,
        lead.email,
        lead.phone,
        lead.address,
        lead.origin,
        lead.document,
        lead.uc,
        lead.status,
      ]
        .map((v) => (v || '').toString().toLowerCase())
        .some((v) => v.includes(q));
    });
  }, [leads, query]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Buscar Lead</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Kanban
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite nome, email, telefone, documento, status..."
              className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : query && results.length === 0 ? (
          <div className="text-gray-500">Nenhum resultado para "{query}"</div>
        ) : (
          <div className="bg-white rounded-xl shadow divide-y">
            {results.slice(0, 100).map((lead) => (
              <div key={lead.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.phone} · {lead.email || 'sem email'}</div>
                  <div className="text-xs text-gray-500">Status: {lead.status}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/dashboard', { state: { focusLeadId: lead.id } })}
                    className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Ver no Kanban
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadSearch;
