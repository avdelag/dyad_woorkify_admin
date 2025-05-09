import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = true; // Replace with your auth logic
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}