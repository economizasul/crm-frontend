// src/components/reports/AnalyticNotes.jsx

import React, { useState, useCallback } from 'react';
import axios from 'axios';
// Assumindo que você tem componentes simples de UI
import LoadingSpinner from '../ui/LoadingSpinner'; 
import ErrorMessage from '../ui/ErrorMessage'; 

const API_ANALYTIC_URL = '/api/reports/analytic';

// Mapeamento simples para cores dos tipos de anotação
const NOTE_TYPE_COLORS = {
    'Ligação': 'bg-blue-100 text-blue-800',
    'Email': 'bg-green-100 text-green-800',
    'Reunião': 'bg-indigo-100 text-indigo-800',
    'Nota': 'bg-gray-100 text-gray-800',
};

// =============================================================
// Componente Analítico Principal
// =============================================================

function AnalyticNotes() {
    const [leadInput, setLeadInput] = useState(''); // Para a busca por ID/Nome
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalyticReport = useCallback(async () => {
        if (!leadInput.trim()) {
            setError('Por favor, insira o ID ou nome de um Lead para buscar.');
            setReportData(null);
            return;
        }

        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            // OBS: Estamos assumindo que leadInput é o 'leadId' por simplicidade. 
            // Em produção, você faria uma busca de Lead por nome/ID primeiro.
            const response = await axios.get(`${API_ANALYTIC_URL}?leadId=${leadInput.trim()}`);
            
            if (response.data.success) {
                setReportData(response.data.data);
            } else {
                setError(response.data.message || 'Falha ao carregar relatório analítico.');
            }
        } catch (err) {
            console.error('Erro na requisição analítica:', err);
            setError('Erro ao buscar o relatório. Verifique o ID e tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [leadInput]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAnalyticReport();
    };
    
    // --- Renderização do Card de Nota ---

    const NoteCard = ({ note }) => {
        const typeColor = NOTE_TYPE_COLORS[note.type] || 'bg-gray-200 text-gray-800';
        const formattedDate = new Date(note.createdAt).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
            <div className="flex mb-8">
                <div className="flex flex-col items-center mr-4">
                    {/* Linha do tempo */}
                    <div className={`w-3 h-3 rounded-full ${note.type === 'Ligação' ? 'bg-blue-500' : 'bg-gray-400'} ring-4 ring-white`}></div>
                    <div className="w-px h-full bg-gray-300"></div>
                </div>
                <div className="flex-1 bg-white p-4 border rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColor}`}>
                            {note.type}
                        </span>
                        <span className="text-xs text-gray-500">{formattedDate}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                        {note.content}
                    </p>
                    {/* Nota: Faltou a info do Vendedor (vendorId), que você precisa popular no ReportDataService */}
                    <p className="text-xs text-right text-gray-400 mt-2">
                        Por: {note.vendorName || 'Vendedor Desconhecido'}
                    </p>
                </div>
            </div>
        );
    };

    // --- Renderização Principal ---

    return (
        <div className="p-4">
            {/* Barra de Pesquisa */}
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar Lead por ID ou Nome..."
                    value={leadInput}
                    onChange={(e) => setLeadInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading || leadInput.length === 0}
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {/* Mensagens de Estado */}
            {loading && <LoadingSpinner message="Carregando histórico do Lead..." />}
            {error && <ErrorMessage message={error} />}
            
            {/* Exibição do Relatório */}
            {reportData && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">
                        Histórico do Lead: <span className="text-blue-600">{reportData.leadInfo.name}</span>
                    </h3>
                    
                    {/* Cartão de Resumo do Lead */}
                    <div className="bg-gray-50 p-4 border rounded-lg shadow-inner mb-6 flex justify-around text-center">
                        <div>
                            <p className="text-sm text-gray-500">Fase Atual</p>
                            <p className="font-semibold text-lg">{reportData.leadInfo.stage}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Valor</p>
                            <p className="font-semibold text-lg">R$ {reportData.leadInfo.value ? reportData.leadInfo.value.toFixed(2).replace('.', ',') : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Origem</p>
                            <p className="font-semibold text-lg">{reportData.leadInfo.source}</p>
                        </div>
                    </div>

                    {/* Linha do Tempo de Atendimentos */}
                    <h4 className="text-xl font-semibold mb-4 border-b pb-2">Linha do Tempo de Interações ({reportData.notes.length} Registros)</h4>
                    
                    <div className="relative">
                        {reportData.notes.length > 0 ? (
                            reportData.notes.map((note, index) => (
                                <NoteCard key={index} note={note} />
                            ))
                        ) : (
                            <p className="text-gray-500 p-4 text-center">Nenhuma anotação encontrada para este Lead.</p>
                        )}
                        
                        {/* Ponto Final da Timeline */}
                        <div className="absolute top-0 left-0 h-full w-px ml-2 bg-gray-300 -z-10"></div> 
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnalyticNotes;