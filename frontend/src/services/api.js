import axios from 'axios';

// Usamos variables de entorno de Vite (si usas Vite) o un valor por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Creamos la instancia centralizada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor opcional: Excelente para meter el token cuando agregues el Login real de Admins
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── ENDPOINTS CENTRALIZADOS ───

export const sedesAPI = {
  obtenerTodas: () => api.get('/sedes'),
  obtenerPorId: (id) => api.get(`/sedes/${id}`),
  crear: (data) => api.post('/sedes', data),
  actualizar: (id, data) => api.put(`/sedes/${id}`, data),
  eliminar: (id) => api.delete(`/sedes/${id}`),
};

export const guardiasAPI = {
  obtenerTodos: () => api.get('/guardias'),
  obtenerPorDni: (dni) => api.get(`/guardias/dni/${dni}`),
  crear: (data) => api.post('/guardias', data),
  actualizar: (id, data) => api.put(`/guardias/${id}`, data),
};

export const turnosAPI = {
  obtenerTodos: () => api.get('/turnos'),
  obtenerPorSede: (sedeId) => api.get(`/turnos/sede/${sedeId}`),
  crear: (data) => api.post('/turnos', data),
};

export const marcacionesAPI = {
  obtenerTodas: () => api.get('/marcaciones'),
  registrar: (data) => api.post('/marcaciones', data),
  obtenerPorGuardia: (guardiaId) => api.get(`/marcaciones/guardia/${guardiaId}`),
};

export const authAPI = {
  loginAdmin: (credenciales) => api.post('/auth/login-admin', credenciales),
};

export const ambientesAPI = {
  obtenerPorSede: (sedeId) => api.get(`/ambientes/sede/${sedeId}`),
  crear: (data) => api.post('/ambientes', data),
  eliminar: (id) => api.delete(`/ambientes/${id}`),
};

export default api;