import axios from 'axios';
import { tokenService } from './tokenService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 20000 // ✅ Add timeout to prevent infinite hanging
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

// ✅ REQUEST INTERCEPTOR - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('[API] 📤 Request with token:', config.url);
    } else {
      // console.log('[API] 📤 Request WITHOUT token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('[API] ❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Handle errors and refresh
api.interceptors.response.use(
  (response) => {
    // console.log('[API] ✅ Response success:', response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

     console.log('[API] ❌ Response error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message
    });

    // ✅ Handle maintenance mode
    if (error.response?.status === 503) {
      // console.log('[API] 🚧 Maintenance mode - redirecting');
      if (typeof window !== 'undefined') {
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    // ✅ Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('[API] ⚠️ Rate limited');
      return Promise.reject(error);
    }

    // ✅ Handle 401 - Token invalid or expired
    if (error.response?.status === 401) {
      // // console.log('[API] 🔐 401 Unauthorized detected');

      // Don't retry if this IS the refresh endpoint
      if (originalRequest.url?.includes('/auth/refresh')) {
        // console.log('[API] ❌ Refresh token invalid - logging out');
        tokenService.clearAll();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Don't retry if already tried
      if (originalRequest._retry) {
        // console.log('[API] ❌ Already retried - logging out');
        tokenService.clearAll();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        // console.log('[API] ⏳ Queueing request while refreshing...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        // console.log('[API] ❌ No refresh token - logging out');
        isRefreshing = false;
        tokenService.clearAll();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Try to refresh
      // console.log('[API] 🔄 Attempting token refresh...');
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { 
          refreshToken 
        }, {
          withCredentials: true,
          timeout: 5000
        });

        if (res.data.token) {
          // console.log('[API] ✅ Token refresh successful');
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
      } catch (refreshError) {
        console.error('[API] ❌ Token refresh failed:', refreshError.message);
        processQueue(refreshError, null);
        tokenService.clearAll();
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;