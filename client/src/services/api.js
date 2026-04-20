import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', 
});

// Intercept outgoing requests to inject the active JWT automatically 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We could also build a generic interceptor tracking 401 returns here natively
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check globally if JWT is structurally invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rather than a physical hard reload, we trust context components to drop explicitly.
      // But we can dispatch events here if we chose.
    }
    return Promise.reject(error);
  }
);

export default api;
