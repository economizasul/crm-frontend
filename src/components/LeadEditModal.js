// src/components/LeadEditModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeadEditModal.css';

const LeadEditModal = ({ lead, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        document: '',
        address: '',
        status: 'Para Contatar',
        origin: 'outros',
        email: '',
        uc: '',
        avgConsumption: '',
        estimatedSavings: '',
        qsa: '',
        notes: '',
    });
    const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', notes: '' });
    const [showSchedule, setShowSchedule] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name || '',
                phone: lead.phone || '',
                document: lead.document || '',
                address: lead.address || '',
                status: lead.status || 'Para Contatar',
                origin: lead.origin || 'outros',
                email: lead.email || '',
                uc: lead.uc || '',
                avgConsumption: lead.avgConsumption || '',
                estimatedSavings: lead.estimatedSavings || '',
                qsa: lead.qsa || '',
                notes: lead.notes || '',
            });
        }
    }, [lead]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScheduleChange = (e) => {
        setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`/api/v1/leads/${lead._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSave(response.data);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
        }
    };

    const handleSchedule = async () => {
        try {
            const response = await axios.post(`/api/v1/leads/${lead._id}/schedule-attendance`, scheduleForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Atendimento agendado!');
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Atendimento Agendado', {
                    body: `Lead: ${formData.name} - ${scheduleForm.date} ${scheduleForm.time}`,
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
            onSave({ ...lead, lastAttendance: response.data.attendanceTime });
            setShowSchedule(false);
        } catch (error) {
            console.error('Erro ao agendar:', error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Editar Lead</h2>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome Completo *" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefone *" required />
                <input name="document" value={formData.document} onChange={handleChange} placeholder="CPF/CNPJ" />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Endereço" />
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Para Contatar">Para Contatar</option>
                    <option value="Em Conversação">Em Conversação</option>
                    <option value="Proposta Enviada">Proposta Enviada</option>
                    <option value="Fechado">Fechado</option>
                    <option value="Perdido">Perdido</option>
                </select>
                <input name="origin" value={formData.origin} onChange={handleChange} placeholder="Origem" />
                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                <input name="uc" value={formData.uc} onChange={handleChange} placeholder="Número da UC" />
                <input name="avgConsumption" value={formData.avgConsumption} onChange={handleChange} placeholder="Consumo Médio (kWh)" />
                <input name="estimatedSavings" value={formData.estimatedSavings} onChange={handleChange} placeholder="Economia Estimada" />
                <input name="qsa" value={formData.qsa} onChange={handleChange} placeholder="QSA" />
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notas Iniciais" />
                <button onClick={handleSave}>Salvar</button>
                <button onClick={() => setShowSchedule(!showSchedule)}>
                    {showSchedule ? 'Cancelar Agendamento' : 'Agendar Atendimento'}
                </button>
                {showSchedule && (
                    <div className="schedule-form">
                        <input type="date" name="date" value={scheduleForm.date} onChange={handleScheduleChange} />
                        <input type="time" name="time" value={scheduleForm.time} onChange={handleScheduleChange} />
                        <textarea name="notes" value={scheduleForm.notes} onChange={handleScheduleChange} placeholder="Notas do Atendimento" />
                        <button onClick={handleSchedule}>Confirmar Agendamento</button>
                    </div>
                )}
                <button onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

export default LeadEditModal;