import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getStats: () => api.get('/auth/stats')
};

// Poll API
export const pollAPI = {
  getAll: (params) => api.get('/polls', { params }),
  getById: (id) => api.get(`/polls/${id}`),
  create: (data) => api.post('/polls', data),
  update: (id, data) => api.put(`/polls/${id}`, data),
  delete: (id) => api.delete(`/polls/${id}`),
  getUserPolls: () => api.get('/polls/user/created'),
  getByCategory: (category, params) => api.get(`/polls/category/${category}`, { params }),
  getTrending: () => api.get('/polls/trending')
};

// Vote API
export const voteAPI = {
  vote: (pollId, data) => api.post(`/votes/${pollId}`, data),
  getStatus: (pollId) => api.get(`/votes/${pollId}/status`),
  getResults: (pollId) => api.get(`/votes/${pollId}/results`),
  removeVote: (pollId) => api.delete(`/votes/${pollId}`)
};

export default api;
