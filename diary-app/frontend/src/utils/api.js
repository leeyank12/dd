import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('diary_user');
  if (user) {
    const { token } = JSON.parse(user);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login if token expires
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('diary_user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export const getDiaryEntries = (params = {}) =>
  api.get('/diary', { params }).then((r) => r.data);

export const getDiaryEntry = (id) =>
  api.get(`/diary/${id}`).then((r) => r.data);

export const createDiaryEntry = (data) =>
  api.post('/diary', data).then((r) => r.data);

export const updateDiaryEntry = (id, data) =>
  api.put(`/diary/${id}`, data).then((r) => r.data);

export const deleteDiaryEntry = (id) =>
  api.delete(`/diary/${id}`).then((r) => r.data);

export const getDashboardData = () =>
  api.get('/analytics/dashboard').then((r) => r.data);

export const getMoodTrend = (days = 30) =>
  api.get('/analytics/mood-trend', { params: { days } }).then((r) => r.data);

export default api;