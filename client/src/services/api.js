import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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
  getMyCharacter: () => api.get('/characters/my'),
  getById: (id) => api.get(`/characters/${id}`),
  create: (data) => api.post('/characters', data),
  update: (id, data) => api.put(`/characters/${id}`, data),
  updateStats: (id, data) => api.put(`/characters/${id}/stats`, data),
  updateSkills: (id, data) => api.put(`/characters/${id}/skills`, data),
  checkUserHasCharacter: (userId) => api.get(`/characters/check?userId=${userId}`),
  checkMyCharacter: () => api.get('/characters/check'),
  
  // Работа с инвентарем
  addInventoryItem: (characterId, item) => api.post(`/characters/${characterId}/inventory`, item),
  updateInventoryItem: (characterId, itemId, item) => api.put(`/characters/${characterId}/inventory/${itemId}`, item),
  deleteInventoryItem: (characterId, itemId) => api.delete(`/characters/${characterId}/inventory/${itemId}`),
  
  // Работа со знаниями
  addKnowledge: (characterId, knowledgeId, data) => api.post(`/characters/${characterId}/knowledge`, { knowledgeId, ...data }),
  getKnowledge: (characterId) => api.get(`/characters/${characterId}/knowledge`),
  
  // Работа с заметками
  addNote: (characterId, data) => api.post(`/characters/${characterId}/notes`, data),
  updateNote: (characterId, noteId, data) => api.put(`/characters/${characterId}/notes/${noteId}`, data),
  deleteNote: (characterId, noteId) => api.delete(`/characters/${characterId}/notes/${noteId}`)
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