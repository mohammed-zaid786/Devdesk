import axios from 'axios';

// Creating a centralized Axios instance for backend API communication
const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

// Request interceptor to automatically attach JWT token to protected routes
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;