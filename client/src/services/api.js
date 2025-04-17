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

// API сервисы
const authService = {
  getDiscordAuthUrl: () => api.get('/auth/discord'),
  verifyToken: () => api.get('/auth/verify'),
  handleCallback: (code) => api.post('/auth/discord/callback', { code })
};

const characterService = {
  getAll: () => api.get('/characters'),
  getMyCharacters: () => api.get('/characters/my'),
  getById: (id) => api.get(`/characters/${id}`),
  create: (data) => api.post('/characters', data),
  updateStats: (id, stats) => api.put(`/characters/${id}/stats`, { stats }),
  addKnowledge: (id, knowledgeId) => api.post(`/characters/${id}/knowledge`, { knowledgeId })
};

const campaignService = {
  getAll: () => api.get('/campaigns/all'),
  getMyCampaigns: () => api.get('/campaigns/my'),
  getPlayerCampaigns: () => api.get('/campaigns/player'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  addCharacter: (id, characterId) => api.post(`/campaigns/${id}/characters`, { characterId }),
  delete: (id) => api.delete(`/campaigns/${id}`)
};

const formulaService = {
  getAll: () => api.get('/formulas'),
  getById: (id) => api.get(`/formulas/${id}`),
  create: (data) => api.post('/formulas', data),
  update: (id, data) => api.put(`/formulas/${id}`, data),
  calculate: (formula, parameters) => api.post('/formulas/calculate', { formula, parameters }),
  delete: (id) => api.delete(`/formulas/${id}`)
};

const userService = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive })
};

const whitelistService = {
  getAll: () => api.get('/users/whitelist'),
  add: (data) => api.post('/users/whitelist', data),
  update: (id, data) => api.put(`/users/whitelist/${id}`, data),
  delete: (id) => api.delete(`/users/whitelist/${id}`)
};

// Новый сервис для работы со справочниками
const referenceService = {
  // Работа с элементами справочника
  getAll: (params) => api.get(addQueryParams('/reference', params)),
  getById: (id) => api.get(`/reference/${id}`),
  create: (data) => api.post('/reference', data),
  update: (id, data) => api.put(`/reference/${id}`, data),
  delete: (id) => api.delete(`/reference/${id}`),
  
  // Категории для справочников
  getCategories: (type) => api.get(`/reference/categories?type=${type}`),
  
  // Методы для работы с правами доступа к справочникам
  getAllPermissions: () => api.get('/reference/permissions/all'),
  getUserPermissions: (userId) => api.get(`/reference/permissions/user/${userId}`),
  getMyPermissions: () => api.get('/reference/permissions/my'),
  addPermission: (data) => api.post('/reference/permissions', data),
  deletePermission: (id) => api.delete(`/reference/permissions/${id}`)
};

export {
  api,
  authService,
  characterService,
  campaignService,
  formulaService,
  userService,
  whitelistService,
  referenceService
};