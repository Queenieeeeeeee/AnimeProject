// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Anime APIs
export const getAnimeList = (limit = 10, offset = 0) => {
  return api.get('/api/anime', {
    params: { limit, offset }
  });
};

export const getAnimeById = (id) => {
  return api.get(`/api/anime/${id}`);
};

export const searchAnime = (query, limit = 10, offset = 0) => {
  return api.get('/api/search', {
    params: { q: query, limit, offset }
  });
};

// Get latest anime for homepage
export const getLatestAnime = (limit = 12) => {
  return api.get('/api/anime/latest', {
    params: { limit }
  });
};

// Analytics APIs
export const getAnalyticsOverview = () => {
  return api.get('/api/analytics/overview');
};

export const getTrendingAnalysis = (year = 2026) => {
  return api.get('/api/analytics/trending', {
    params: { year }
  });
};

// Studios API
export const getStudios = (years = 5, sortBy = 'workload', limit = 10) => {
  return api.get('/api/analytics/studios', {
    params: { years, sort_by: sortBy, limit }
  });
};

// Genres API (if you have one)
export const getGenres = (years = 5, sortBy = 'potential', limit = 20) => {
  return api.get('/api/analytics/genres', {
    params: { years, sort_by: sortBy, limit }
  });
};

export default api;