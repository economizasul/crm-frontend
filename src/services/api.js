// src/services/api.js (FRONTEND)
// Axios instance used by React components to call backend API

import axios from 'axios';

const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_BASE_URL = RAW_BASE.replace(/\/$/, '');

// NOTE: We leave the API prefix to the call sites (ReportsPage uses /api/reports/...)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
    const userInfoRaw = localStorage.getItem('userInfo');
    if (userInfoRaw) {
      const userInfo = JSON.parse(userInfoRaw);
      if (userInfo?.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
  } catch (e) {
    // silent
  }
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use((resp) => resp, (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) {
    try { localStorage.removeItem('userInfo'); localStorage.removeItem('token'); } catch(e){}
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
