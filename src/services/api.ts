import axios from 'axios';
const api = axios.create({ baseURL: 'https://cameras.jacarezinho.cloud/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sivi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('sivi_token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export default api;
