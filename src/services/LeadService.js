// src/services/LeadService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const LeadService = {
  async getAssignableUsers(token) {
    const res = await axios.get(`${API_BASE_URL}/api/v1/leads/users/reassignment`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async uploadAttachment(leadId, file, user, token) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadId', leadId);
    formData.append('user', user);

    const res = await axios.post(`${API_BASE_URL}/api/v1/leads/upload-attachment`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async updateLead(leadId, payload, token) {
    const res = await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async markLeadAsWon(leadId, token) {
    const res = await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, { date_won: new Date().toISOString() }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async transferLead(leadId, newOwnerId, token) {
    const res = await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}/reassign`, 
      { newOwnerId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  }
};

export default LeadService;
