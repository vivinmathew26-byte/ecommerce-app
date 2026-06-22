import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post('/api/users/token/refresh/', { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return API(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/users/register/', data),
  login: (data) => API.post('/users/login/', data),
  getProfile: () => API.get('/users/profile/'),
  updateProfile: (data) => API.patch('/users/profile/', data),
};

export const productAPI = {
  getAll: (params) => API.get('/products/', { params }),
  getOne: (id) => API.get(`/products/${id}/`),
  create: (data) => API.post('/products/', data),
  getCategories: () => API.get('/products/categories/'),
  addReview: (data) => API.post('/products/reviews/', data),
};

export const cartAPI = {
  get: () => API.get('/cart/'),
  add: (data) => API.post('/cart/', data),
  remove: (itemId) => API.delete(`/cart/${itemId}/`),
  clear: () => API.delete('/cart/'),
};

export const orderAPI = {
  getAll: () => API.get('/orders/'),
  getOne: (id) => API.get(`/orders/${id}/`),
  create: (data) => API.post('/orders/', data),
};

export default API;
