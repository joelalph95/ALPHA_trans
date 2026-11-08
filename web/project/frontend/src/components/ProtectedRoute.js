import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;