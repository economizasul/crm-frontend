import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

// Definição estática das fases do Kanban
// ...

const KanbanBoard = () => {
    const navigate = useNavigate(); 


    // FUNÇÃO PARA BUSCAR OS LEADS
    useEffect(() => {
        const fetchLeads = async () => {
            const token = localStorage.getItem('userToken'); 

            if (!token) {
                console.error("Token de autenticação não encontrado. Redirecionando para login.");
                setApiError(true);
                setIsLoading(false);
                //AÇÃO CRÍTICA: REDIRECIONAR PARA O LOGIN
                navigate('/login'); 
                return;
            }

            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                };

                const response = await axios.get(API_URL, config); 
                
                setLeads(response.data); 
                setApiError(false);
            } catch (error) {
                console.error('Erro ao buscar leads:', error.response ? error.response.data : error.message);
                
                // TRATAR ERRO 401: Se o token for inválido, redireciona também
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('userToken');
                    navigate('/login'); 
                }
                
                setApiError(true);
            } finally {
                setIsLoading(false); 
            }
        };

        fetchLeads();
    }, [navigate]); //useNavigate deve ser uma dependência do useEffect

};

export default KanbanBoard;