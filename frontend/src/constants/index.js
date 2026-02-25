// src/constants/index.js

// Fallback image for anime cards when image fails to load
export const FALLBACK_ANIME_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="225" height="318"%3E%3Crect width="225" height="318" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

// Scroll threshold for "Back to Top" button
export const SCROLL_THRESHOLD = 300;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

// API rate limiting
export const API_RATE_LIMIT_DELAY = 100; // ms between requests