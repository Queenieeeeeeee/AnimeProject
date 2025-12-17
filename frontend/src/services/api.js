// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Home 頁面 ====================
export const getLatestAnime = (limit = 12) => {
  return api.get('/anime/latest', { params: { limit } });
};

export const getRandomAnime = () => {
  return api.get('/anime/random');
};

// ==================== Detail 頁面 ====================
export const getAnimeById = (id) => {
  return api.get(`/anime/${id}`);
};

export const getAnimeByMalId = (malId) => {
  return api.get(`/anime/mal/${malId}`);
};

// ==================== Browse 頁面 ====================
export const getAnimeList = (limit = 10, offset = 0) => {
  return api.get('/anime', { params: { limit, offset } });
};

export const searchAnime = (params) => {
  return api.get('/search', { params });
};

export const getGenres = () => {
  return api.get('/genres');
};

// ==================== Discover 頁面 ====================
export const getPopularAnime = (limit = 20, offset = 0) => {
  return api.get('/recommendations/popular', { params: { limit, offset } });
};

export const getTopRatedAnime = (limit = 20, offset = 0) => {
  return api.get('/recommendations/top-rated', { params: { limit, offset } });
};

export const getHiddenGems = (limit = 20, offset = 0) => {
  return api.get('/recommendations/hidden-gems', { params: { limit, offset } });
};

export const getLatestRecommendations = (limit = 20, offset = 0) => {
  return api.get('/recommendations/latest', { params: { limit, offset } });
};

export const getTrendingAnime = (limit = 20, offset = 0) => {
  return api.get('/recommendations/trending', { params: { limit, offset } });
};

export const getAnimeByGenre = (genreName, limit = 20, offset = 0) => {
  return api.get(`/recommendations/genre/${genreName}`, { params: { limit, offset } });
};

export const getAnimeByStudio = (studioName, limit = 20, offset = 0) => {
  return api.get(`/recommendations/studio/${studioName}`, { params: { limit, offset } });
};

export const getGenresList = () => {
  return api.get('/recommendations/genres/list');
};

export const getStudiosList = (limit = 50) => {
  return api.get('/recommendations/studios/list', { params: { limit } });
};

export default api;