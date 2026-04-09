export interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  published_at?: string;
  category?: { _id: string; name?: string } | string;
}

export interface Category {
  _id: string;
  name: string;
  books?: Book[];
}

export interface OrderItem {
  _id: string;
  book: { _id: string; title: string; author: string; price: number };
  quantity: number;
}

export interface Order {
  _id: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  orderItems?: OrderItem[];
  user?: { fName: string; lName: string; email: string };
}

export interface User {
  _id: string;
  fName: string;
  lName: string;
  email: string;
  address?: string;
  tel?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  code?: number;
  message?: string;
  status?: number;
  data?: T;
  error?: string;
  details?: string[];
}
