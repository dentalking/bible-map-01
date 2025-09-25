import axios from 'axios';
import type {
  ApiResponse,
  Person,
  Location,
  Event,
  Journey,
  Theme,
  SearchResults,
  SearchSuggestion,
  GeoJSONFeatureCollection,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
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
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Persons
  persons: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      testament?: string;
      search?: string;
    }): Promise<ApiResponse<Person[]>> => api.get('/api/persons', { params }),

    getById: (id: string): Promise<Person> => api.get(`/api/persons/${id}`),

    create: (data: Partial<Person>): Promise<Person> => api.post('/api/persons', data),

    update: (id: string, data: Partial<Person>): Promise<Person> =>
      api.put(`/api/persons/${id}`, data),

    delete: (id: string): Promise<void> => api.delete(`/api/persons/${id}`),
  },

  // Locations
  locations: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      bounds?: string;
    }): Promise<ApiResponse<Location[]>> => api.get('/api/locations', { params }),

    getById: (id: string): Promise<Location> => api.get(`/api/locations/${id}`),

    getGeoJSON: (): Promise<GeoJSONFeatureCollection> => api.get('/api/locations/map/geojson'),

    create: (data: Partial<Location>): Promise<Location> => api.post('/api/locations', data),

    update: (id: string, data: Partial<Location>): Promise<Location> =>
      api.put(`/api/locations/${id}`, data),

    delete: (id: string): Promise<void> => api.delete(`/api/locations/${id}`),
  },

  // Events
  events: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      testament?: string;
      category?: string;
      search?: string;
      yearFrom?: number;
      yearTo?: number;
    }): Promise<ApiResponse<Event[]>> => api.get('/api/events', { params }),

    getTimeline: (): Promise<Record<string, Event[]>> => api.get('/api/events/timeline'),

    getById: (id: string): Promise<Event> => api.get(`/api/events/${id}`),

    create: (data: Partial<Event>): Promise<Event> => api.post('/api/events', data),

    update: (id: string, data: Partial<Event>): Promise<Event> =>
      api.put(`/api/events/${id}`, data),

    delete: (id: string): Promise<void> => api.delete(`/api/events/${id}`),
  },

  // Journeys
  journeys: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      personId?: string;
      search?: string;
    }): Promise<ApiResponse<Journey[]>> => api.get('/api/journeys', { params }),

    getPaths: (): Promise<GeoJSONFeatureCollection> => api.get('/api/journeys/map/paths'),

    getById: (id: string): Promise<Journey> => api.get(`/api/journeys/${id}`),

    create: (data: Partial<Journey>): Promise<Journey> => api.post('/api/journeys', data),

    update: (id: string, data: Partial<Journey>): Promise<Journey> =>
      api.put(`/api/journeys/${id}`, data),

    delete: (id: string): Promise<void> => api.delete(`/api/journeys/${id}`),
  },

  // Themes
  themes: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    }): Promise<ApiResponse<Theme[]>> => api.get('/api/themes', { params }),

    getCategories: (): Promise<{ category: string; count: number }[]> =>
      api.get('/api/themes/categories'),

    getById: (id: string): Promise<Theme> => api.get(`/api/themes/${id}`),

    create: (data: Partial<Theme>): Promise<Theme> => api.post('/api/themes', data),

    update: (id: string, data: Partial<Theme>): Promise<Theme> =>
      api.put(`/api/themes/${id}`, data),

    delete: (id: string): Promise<void> => api.delete(`/api/themes/${id}`),
  },

  // Search
  search: {
    query: (q: string, limit?: number): Promise<SearchResults> =>
      api.get('/api/search', { params: { q, limit } }),

    suggestions: (q: string): Promise<SearchSuggestion[]> =>
      api.get('/api/search/suggestions', { params: { q } }),
  },

  // Health check
  health: (): Promise<{ status: string; timestamp: string }> => api.get('/health'),
};

export default api;