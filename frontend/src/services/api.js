// src/services/api.js
import axios from 'axios';

// Use environment variable with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Home Page ====================
export const getLatestAnime = (limit = 12) => {
  return api.get('/anime/latest', { params: { limit } });
};

export const getRandomAnime = () => {
  return api.get('/anime/random');
};

// ==================== Detail Page ====================
export const getAnimeById = (id) => {
  return api.get(`/anime/${id}`);
};

export const getAnimeByMalId = (malId) => {
  return api.get(`/anime/mal/${malId}`);
};

// ==================== Browse Page ====================
export const getAnimeList = (limit = 10, offset = 0) => {
  return api.get('/anime', { params: { limit, offset } });
};

export const searchAnime = (params) => {
  return api.get('/search', { params });
};

export const getGenres = () => {
  return api.get('/genres');
};

export const getYears = () => {
  return api.get('/years');
};

// ==================== Discover Page ====================
export const getClassicsAnime = (limit = 20, offset = 0) => {
  return api.get('/recommendations/classics', { params: { limit, offset } });
};

export const getRecentHitsAnime = (limit = 20, offset = 0) => {
  return api.get('/recommendations/recent-hits', { params: { limit, offset } });
};

export const getHiddenGems = (limit = 20, offset = 0) => {
  return api.get('/recommendations/hidden-gems', { params: { limit, offset } });
};

export const getAnimeByStudio = (studioName, limit = 20, offset = 0) => {
  return api.get(`/recommendations/studio/${studioName}`, { params: { limit, offset } });
};

export const getStudiosList = (limit = 50) => {
  return api.get('/recommendations/studios/list', { params: { limit } });
};

// Export the base URL for use in other components (e.g., RelatedWorks)
export { API_BASE_URL };

export default api;