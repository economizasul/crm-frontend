import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';

export default function Configuracoes() {
    const { user } = useAuth();
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.acesso_configuracoes) {
            carregarVendedores();
        }
    }, [user]);

    const carregarVendedores = async () => {
        try {
            const res = await api.get('/configuracoes/vendedores');
            setVendedores(res.data);
        } catch (err) {
            alert('Erro ao carregar vendedores');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (id, campo, valor) => {
        const updated = vendedores.map(v =>
            v.id === id
                ? {
                      ...v,
                      [campo]: valor,
                      relatorios_proprios_only: campo === 'relatorios_todos' && valor ? false : v.relatorios_proprios_only,
                      relatorios_todos: campo === 'relatorios_proprios_only' && valor ? false : v.relatorios_todos
                  }
                : v
        );

        try {
            await api.put(`/configuracoes/vendedor/${id}`, updated.find(v => v.id === id));
            setVendedores(updated);
        } catch (err) {
            alert('Erro ao salvar');
        }
    };

    if (!user?.acesso_configuracoes) {
        return <div className="p-6">Acesso negado.</div>;
    }

    if (loading) return <div className="p-6">Carregando...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Configurações de Permissões</h1>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Relatórios Próprios</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Relatórios de Todos</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transferir Leads</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {vendedores.map(v => (
                            <tr key={v.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {v.name} <span className="text-gray-500">({v.email})</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={v.relatorios_proprios_only}
                                        onChange={e => handleChange(v.id, 'relatorios_proprios_only', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={v.relatorios_todos}
                                        onChange={e => handleChange(v.id, 'relatorios_todos', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={v.transferencia_leads}
                                        onChange={e => handleChange(v.id, 'transferencia_leads', e.target.checked)}
                                        disabled={v.role === 'Admin'}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}