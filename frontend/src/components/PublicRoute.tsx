import { Navigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated } = useApi();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
