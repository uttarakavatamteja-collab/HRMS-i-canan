import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Companies
export const companyAPI = {
  register: (data) => api.post('/companies/register', data),
};

// Employees
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Attendance
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  markBulk: (data) => api.post('/attendance/bulk', data),
};

// Leaves
export const leaveAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  apply: (data) => api.post('/leaves', data),
  updateStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
};

// Payroll
export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  generate: (data) => api.post('/payroll/generate', data),
  updateStatus: (id, data) => api.put(`/payroll/${id}`, data),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
