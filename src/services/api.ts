import axios from 'axios';
import { API_CONFIG } from '../config/constants';
import { getSessionToken } from '../storage/session';

/**
 * Shared Axios Instance for NAGAR-X Mobile App
 * Configured with base URL, timeout, and request interceptors for Authorization headers.
 */
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token dynamically to every request
api.interceptors.request.use(
  async (config) => {
    const token = await getSessionToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
