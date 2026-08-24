import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/constants';
import { getSessionToken, clearSession } from '../storage/session';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token and handle FormData Content-Type
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getSessionToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // If sending FormData (multipart upload), delete default Content-Type so boundary is set automatically
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch (err) {
      console.warn('[API Client] Error reading auth token for request:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response Interceptor: Global Error and 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('[API Client] 401 Unauthorized encountered. Clearing session...');
      // Clear invalid/expired token from storage
      try {
        await clearSession();
      } catch (clearErr) {
        console.error('[API Client] Error clearing expired session:', clearErr);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
