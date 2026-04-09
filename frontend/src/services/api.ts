import axios, { type AxiosInstance } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Books
export const booksApi = {
  getBooks: () => api.get('/books'),
  getBook: (id: string) => api.get(`/books/${id}`),
  createBook: (data: object) => api.post('/books', data),
  updateBook: (id: string, data: object) => api.put(`/books/${id}`, data),
  deleteBook: (id: string) => api.delete(`/books/${id}`),
};

// Categories
export const categoriesApi = {
  getCategories: () => api.get('/categories'),
  getCategory: (id: string) => api.get(`/categories/${id}`),
  createCategory: (data: object) => api.post('/categories', data),
  updateCategory: (id: string, data: object) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

// Auth
export const authApi = {
  register: (data: { fName: string; lName: string; email: string; address: string; tel: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Orders
export const ordersApi = {
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: object) => api.post('/orders', data),
  getAllOrders: () => api.get('/orders/admin/all'),
  updateOrderStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};
