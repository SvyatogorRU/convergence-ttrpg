import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Создание инстанса axios с базовым URL
const api = axios.create({
  baseURL: API_URL
});

// Добавление перехватчика запросов для установки токена
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Добавление перехватчика ответов для обработки ошибок аутентификации
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Если сервер вернул 401 или 403, выходим из системы
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Вспомогательная функция для добавления параметров запроса
const addQueryParams = (url, params) => {
  if (!params) return url;
  
  const queryParams = [];
  for (const key in params) {
    if (params[key] !== undefined) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  
  return queryParams.length > 0 ? `${url}?${queryParams.join('&')}` : url;
};

// API сервисы
const authService = {
  getDiscordAuthUrl: () => api.get('/auth/discord'),
  verifyToken: () => api.get('/auth/verify'),
  handleCallback: (code) => api.post('/auth/discord/callback', { code })
};

const characterService = {
  getAll: (params) => api.get(addQueryParams('/characters', params)),
  getMyCharacters: (params) => api.get(addQueryParams('/characters/my', params)),
  getById: (id) => api.get(`/characters/${id}`),
  create: (data) => api.post('/characters', data),
  updateStats: (id, stats) => api.put(`/characters/${id}/stats`, { stats }),
  addKnowledge: (id, knowledgeId) => api.post(`/characters/${id}/knowledge`, { knowledgeId })
};

const campaignService = {
  getAll: (params) => api.get(addQueryParams('/campaigns/all', params)),
  getMyCampaigns: (params) => api.get(addQueryParams('/campaigns/my', params)),
  getPlayerCampaigns: (params) => api.get(addQueryParams('/campaigns/player', params)),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  addCharacter: (id, characterId) => api.post(`/campaigns/${id}/characters`, { characterId }),
  delete: (id) => api.delete(`/campaigns/${id}`)
};

const formulaService = {
  getAll: (params) => api.get(addQueryParams('/formulas', params)),
  getById: (id) => api.get(`/formulas/${id}`),
  create: (data) => api.post('/formulas', data),
  update: (id, data) => api.put(`/formulas/${id}`, data),
  calculate: (formula, parameters) => api.post('/formulas/calculate', { formula, parameters }),
  delete: (id) => api.delete(`/formulas/${id}`)
};

const userService = {
  getAll: (params) => api.get(addQueryParams('/users', params)),
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive })
};

const whitelistService = {
  getAll: (params) => api.get(addQueryParams('/users/whitelist', params)),
  add: (data) => api.post('/users/whitelist', data),
  update: (id, data) => api.put(`/users/whitelist/${id}`, data),
  delete: (id) => api.delete(`/users/whitelist/${id}`)
};

export {
  api,
  authService,
  characterService,
  campaignService,
  formulaService,
  userService,
  whitelistService
};