// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const handledCodes = [400, 401, 403, 404, 409, 422];
    
    if (error.response) {
      // Handle HTTP errors with responses
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      });
    }
    
    if (error.request) {
      // Handle network errors
      return Promise.reject({
        message: 'Network error - please check your connection',
        status: 0
      });
    }

    // Handle other errors
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      status: 500
    });
  }
);

export default api;