import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ApiProvider } from './contexts/ApiContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { routeConfigs } from './routes/routeConfig';
import './App.css';

function App() {
  return (
    <ApiProvider>
      <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {routeConfigs.map(({ path, isPrivate, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  isPrivate ? (
                    <ProtectedRoute>
                      <Component />
                    </ProtectedRoute>
                  ) : path === '/login' || path === '/register' ? (
                    <PublicRoute redirectTo="/">
                      <Component />
                    </PublicRoute>
                  ) : (
                    <Component />
                  )
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </CartProvider>
    </ApiProvider>
  );
}

export default App;
