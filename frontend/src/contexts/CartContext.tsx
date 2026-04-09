import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
}

const CART_KEY = 'bookstore_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (book: { _id: string; title: string; author: string; price: number }, quantity?: number) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeItem: (bookId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback(
    (book: { _id: string; title: string; author: string; price: number }, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.bookId === book._id);
        if (existing) {
          return prev.map((i) =>
            i.bookId === book._id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { bookId: book._id, title: book.title, author: book.author, price: book.price, quantity }];
      });
    },
    []
  );

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.bookId !== bookId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const value: CartContextValue = {
    items,
    count,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
