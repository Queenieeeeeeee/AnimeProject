// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,  // 👈 加上 /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anime APIs
export const getAnimeList = (limit = 10, offset = 0) => {
  return api.get('/anime', {  // 👈 移除 /api (因為 baseURL 已經有了)
    params: { limit, offset }
  });
};

export const getAnimeById = (id) => {
  return api.get(`/anime/${id}`);  // 👈 移除 /api
};

export const searchAnime = (query, limit = 10, offset = 0) => {
  return api.get('/search', {  // 👈 移除 /api
    params: { q: query, limit, offset }
  });
};

export const getLatestAnime = (limit = 12) => {
  return api.get('/anime/latest', {  // 👈 移除 /api
    params: { limit }
  });
};

// Analytics APIs
export const getAnalyticsOverview = () => {
  return api.get('/analytics/overview');  // 👈 移除 /api
};

export const getTrendingAnalysis = (year) => {
  return api.get('/analytics/trending', {  // 👈 移除 /api
    params: { year }
  });
};

export const getStudios = (years = 5, sortBy = 'workload', limit = 10) => {
  return api.get('/analytics/studios', {  // 👈 移除 /api
    params: { years, sort_by: sortBy, limit }
  });
};

export const getGenres = (sortBy = 'market_score', order = 'desc') => {
  return api.get('/analytics/genres', {  // 👈 移除 /api
    params: { 
      sort_by: sortBy,
      order: order
    }
  });
};

// Recommendations API
export const getRecommendations = async (animeId, limit = 10) => {
  const response = await api.get(`/anime/${animeId}/recommendations`, {
    params: { limit }
  });
  return response.data;
};

export default api;