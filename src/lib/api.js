import axios from 'axios';
import { tokenService } from './tokenService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('[API] Rate limited');
      return Promise.reject(error);
    }

    // Handle 401 - token invalid or expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh token
      const refreshToken = tokenService.getRefreshToken();

      if (refreshToken) {
        try {
          const res = await api.post('/auth/refresh', { refreshToken });

          if (res.data.token) {
            tokenService.setToken(res.data.token);
            if (res.data.refreshToken) {
              tokenService.setRefreshToken(res.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            processQueue(null, res.data.token);
            return api(originalRequest);
          } else {
            throw new Error('No token in refresh response');
          }
        } catch (err) {
          processQueue(err, null);
          // Token refresh failed - clear auth and redirect to login
          tokenService.removeToken();
          tokenService.removeRefreshToken();

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(err);
        }
      } else {
        // No refresh token available
        tokenService.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    // Handle other 401 errors
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized - redirecting to login');
      tokenService.removeToken();
      tokenService.removeRefreshToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;