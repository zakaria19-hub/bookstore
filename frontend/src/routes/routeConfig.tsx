import type { RouteConfig } from '../utils/routes';
import { HomePage } from '../pages/HomePage';
import { BooksPage } from '../pages/BooksPage';
import { BookDetailPage } from '../pages/BookDetailPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CategoryDetailPage } from '../pages/CategoryDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { CartPage } from '../pages/CartPage';
import { DashboardPage } from '../pages/DashboardPage';

export const routeConfigs: RouteConfig[] = [
  { path: '/', isPrivate: false, component: HomePage },
  { path: '/books', isPrivate: false, component: BooksPage },
  { path: '/books/:id', isPrivate: false, component: BookDetailPage },
  { path: '/categories', isPrivate: false, component: CategoriesPage },
  { path: '/categories/:id', isPrivate: false, component: CategoryDetailPage },
  { path: '/cart', isPrivate: false, component: CartPage },
  { path: '/dashboard', isPrivate: true, component: DashboardPage },
  { path: '/login', isPrivate: false, component: LoginPage },
  { path: '/register', isPrivate: false, component: RegisterPage },
  { path: '/orders', isPrivate: true, component: OrdersPage },
  { path: '/orders/:id', isPrivate: true, component: OrderDetailPage },
];
