import { Navigate, useLocation } from 'react-router-dom';


import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children ,role}) {
  console.log("start test");
  const { user, loading } = useAuth();
  
  const location = useLocation();

   if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}
