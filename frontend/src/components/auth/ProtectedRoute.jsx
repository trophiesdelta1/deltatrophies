import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAdminToken } from '../../utils/auth';

function ProtectedRoute() {
  const location = useLocation();

  if (!getAdminToken()) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
