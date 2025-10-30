// src/pages/Configuracoes.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

export default function Configuracoes() {
    const { user } = useAuth();
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);

    // CORREÇÃO: Admin sempre acessa, ou se tiver permissão
    const podeAcessar = user?.role === 'Admin' || user?.acesso_configuracoes === true;

    useEffect(() => {
        if (podeAcessar) {
            carregarVendedores();
        }
    }, [user, podeAcessar]);

    const carregarVendedores = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/v1/configuracoes/vendedores`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendedores(res.data);
        } catch (err) {
            console.error('Erro ao carregar vendedores:', err);
            alert('Erro ao carregar vendedores');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (id, campo, valor) => {
        const vendedorAtual = vendedores.find(v => v.id === id);
        const updatedVendedor = {
            ...vendedorAtual,
            [campo]: valor,
            // Lógica mútua exclusiva para relatórios
            relatorios_proprios_only: campo === 'relatorios_todos' && valor ? false : vendedorAtual.relatorios_proprios_only,
            relatorios_todos: campo === 'relatorios_proprios_only' && valor ? false : vendedorAtual.relatorios_todos
        };

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/v1/configuracoes/vendedor/${id}`,
                updatedVendedor,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Atualiza localmente
            setVendedores(prev => prev.map(v => v.id === id ? updatedVendedor : v));
            alert('Permissão atualizada com sucesso!');
        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar permissão');
        }
    };

    if (!podeAcessar) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
                    <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
                    <p className="text-sm text-gray-500 mt-2">Role atual: {user?.role}</p>
                    <p className="text-sm text-gray-500">Acesso Config: {user?.acesso_configuracoes ? 'Sim' : 'Não'}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Configurações de Permissões</h1>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Relatórios Próprios</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Relatórios de Todos</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Transferir Leads</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {vendedores.length > 0 ? (
                            vendedores.map(v => (
                                <tr key={v.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {v.name} <span className="text-gray-500">({v.email})</span>
                                        {v.role === 'Admin' && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Admin</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={v.relatorios_proprios_only || false}
                                            onChange={e => handleChange(v.id, 'relatorios_proprios_only', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            disabled={v.role === 'Admin'}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={v.relatorios_todos || false}
                                            onChange={e => handleChange(v.id, 'relatorios_todos', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            disabled={v.role === 'Admin'}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={v.transferencia_leads || false}
                                            onChange={e => handleChange(v.id, 'transferencia_leads', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            disabled={v.role === 'Admin'}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    Nenhum vendedor encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}