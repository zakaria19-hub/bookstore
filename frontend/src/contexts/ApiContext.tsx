import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authApi, booksApi, categoriesApi, ordersApi } from '../services/api';
import type { AxiosResponse } from 'axios';

type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RegisterInput {
  fName: string;
  lName: string;
  email: string;
  address: string;
  tel: string;
  password: string;
}

interface ApiContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  status: ApiStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  getBooks: () => Promise<AxiosResponse>;
  getBook: (id: string) => Promise<AxiosResponse>;
  createBook: (data: object) => Promise<AxiosResponse>;
  updateBook: (id: string, data: object) => Promise<AxiosResponse>;
  deleteBook: (id: string) => Promise<AxiosResponse>;
  getCategories: () => Promise<AxiosResponse>;
  getCategory: (id: string) => Promise<AxiosResponse>;
  createCategory: (data: object) => Promise<AxiosResponse>;
  updateCategory: (id: string, data: object) => Promise<AxiosResponse>;
  deleteCategory: (id: string) => Promise<AxiosResponse>;
  getOrders: () => Promise<AxiosResponse>;
  getOrder: (id: string) => Promise<AxiosResponse>;
  createOrder: (data: object) => Promise<AxiosResponse>;
  getAllOrders: () => Promise<AxiosResponse>;
  updateOrderStatus: (id: string, status: string) => Promise<AxiosResponse>;
}

function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const d = (err as { response?: { data?: { error?: string; message?: string; details?: string[] } } })?.response?.data;
  if (d?.error) return d.error;
  if (d?.message) return d.message;
  if (Array.isArray(d?.details) && d.details.length) return d.details.join(', ');
  return fallback;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [status, setStatus] = useState<ApiStatus>('idle');

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  }, []);

  const isAuthenticated = !!token;

  const withToast = useCallback(
    async <T,>(fn: () => Promise<T>, successMsg?: string, errorMsg?: string): Promise<T> => {
      setStatus('loading');
      try {
        const res = await fn();
        setStatus('success');
        if (successMsg) toast.success(successMsg);
        return res;
      } catch (e) {
        setStatus('error');
        toast.error(getErrorMessage(e, errorMsg));
        throw e;
      } finally {
        setStatus('idle');
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await withToast(
        () => authApi.login({ email, password }),
        'Logged in successfully',
        'Login failed'
      );
      const payload = data as { data?: { token?: string } };
      const t = payload?.data?.token;
      if (t) setToken(t);
    },
    [setToken, withToast]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { data } = await withToast(
        () => authApi.register(input),
        'Account created successfully',
        'Registration failed'
      );
      const payload = data as { data?: { token?: string } };
      const t = payload?.data?.token;
      if (t) setToken(t);
    },
    [setToken, withToast]
  );

  const logout = useCallback(() => {
    setToken(null);
    toast.success('Logged out');
  }, [setToken]);

  const value: ApiContextValue = {
    token,
    setToken,
    isAuthenticated,
    status,
    login,
    register,
    logout,
    getBooks: () => booksApi.getBooks(),
    getBook: (id) => booksApi.getBook(id),
    createBook: (data) => withToast(() => booksApi.createBook(data), 'Book created'),
    updateBook: (id, data) => withToast(() => booksApi.updateBook(id, data), 'Book updated'),
    deleteBook: (id) => withToast(() => booksApi.deleteBook(id), 'Book deleted'),
    getCategories: () => categoriesApi.getCategories(),
    getCategory: (id) => categoriesApi.getCategory(id),
    createCategory: (data) => withToast(() => categoriesApi.createCategory(data), 'Category created'),
    updateCategory: (id, data) => withToast(() => categoriesApi.updateCategory(id, data), 'Category updated'),
    deleteCategory: (id) => withToast(() => categoriesApi.deleteCategory(id), 'Category deleted'),
    getOrders: () => ordersApi.getOrders(),
    getOrder: (id) => ordersApi.getOrder(id),
    createOrder: (data) => withToast(() => ordersApi.createOrder(data), 'Order created'),
    getAllOrders: () => ordersApi.getAllOrders(),
    updateOrderStatus: (id, status) => withToast(() => ordersApi.updateOrderStatus(id, status), 'Status updated'),
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}
