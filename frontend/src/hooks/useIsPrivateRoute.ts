import { useLocation } from 'react-router-dom';
import { isPrivate } from '../utils/routes';
import { routeConfigs } from '../routes/routeConfig';

/**
 * Detects if the current route (after page load/navigation) is private.
 * Use for conditional UI (e.g. show/hide nav based on route).
 */
export function useIsPrivateRoute(): boolean {
  const { pathname } = useLocation();
  return isPrivate(pathname, routeConfigs);
}
