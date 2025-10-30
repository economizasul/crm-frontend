// src/pages/Configuracoes.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

export default function Configuracoes() {
    const { user, refreshUser } = useAuth(); // Adicionado refreshUser
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);

    const podeAcessar = user?.role === 'Admin' || user?.acesso_configuracoes === true;

    useEffect(() => {
        if (podeAcessar) {
            carregarVendedores();
        }
    }, [podeAcessar]);

    const carregarVendedores = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/v1/configuracoes/vendedores`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendedores(res.data);
        } catch (err) {
            console.error('Erro ao carregar:', err.response?.data || err);
            alert('Erro ao carregar vendedores');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (id, campo, valor) => {
        // 1. Atualiza localmente primeiro (UI responde na hora)
        const updated = vendedores.map(v =>
            v.id === id
                ? {
                      ...v,
                      [campo]: valor,
                      // Lógica mútua exclusiva apenas entre relatórios
                      relatorios_proprios_only: campo === 'relatorios_todos' && valor ? false : v.relatorios_proprios_only,
                      relatorios_todos: campo === 'relatorios_proprios_only' && valor ? false : v.relatorios_todos
                  }
                : v
        );

        setVendedores(updated); // UI atualiza imediatamente

        // 2. Envia apenas os campos necessários
        const vendedorAtualizado = updated.find(v => v.id === id);
        const payload = {
            relatorios_proprios_only: vendedorAtualizado.relatorios_proprios_only,
            relatorios_todos: vendedorAtualizado.relatorios_todos,
            transferencia_leads: vendedorAtualizado.transferencia_leads,
            acesso_configuracoes: vendedorAtualizado.acesso_configuracoes
        };

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/v1/configuracoes/vendedor/${id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Permissão atualizada com sucesso!');

            // 3. Atualiza o usuário logado (se for ele mesmo)
            if (user?.id === id && refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Erro ao salvar permissão:', err.response?.data || err);
            alert('Erro ao salvar permissão');
            carregarVendedores(); // Reverte em caso de erro
        }
    };

    if (!podeAcessar) {
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
                                    {v.role === 'Admin' && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Admin</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={v.relatorios_proprios_only}
                                        onChange={e => handleChange(v.id, 'relatorios_proprios_only', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                        disabled={v.role === 'Admin'}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={v.relatorios_todos}
                                        onChange={e => handleChange(v.id, 'relatorios_todos', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                        disabled={v.role === 'Admin'}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={v.transferencia_leads}
                                        onChange={e => handleChange(v.id, 'transferencia_leads', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                        disabled={v.role === 'Admin'}
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