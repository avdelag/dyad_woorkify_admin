"use client";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/Loading"; // Asegúrate que Loading exista y funcione

export const ProtectedRoute = ({ children }: { children?: JSX.Element }) => {
  const { session, user, profile, isAdmin, isLoading } = useAuth(); // Obtenemos todos los estados relevantes
  const location = useLocation();

  console.log(
    "[ProtectedRoute] Evaluating access. isLoading:", isLoading, 
    "Session exists:", !!session, 
    "User ID:", user?.id,
    "Profile loaded:", !!profile,
    "isAdmin:", isAdmin,
    "Target path:", location.pathname
  );

  if (isLoading) {
    console.log("[ProtectedRoute] Auth state is loading. Rendering <Loading /> component.");
    return <Loading />; 
  }

  if (!session) {
    console.log("[ProtectedRoute] No session found. Redirecting to /login.");
    return <Navigate to="/login" state={{ from: location, error: "Please log in to access this page." }} replace />;
  }

  // En este punto, tenemos una sesión. Ahora verificamos si es admin.
  // El perfil ya debería estar cargado (o ser null) porque isLoading es false.
  if (!isAdmin) {
    console.warn(`[ProtectedRoute] User (ID: ${user?.id}, Email: ${user?.email}) has session but is NOT admin (profile?.is_admin: ${profile?.is_admin}). Redirecting to /login with error.`);
    // Podrías tener una página específica de "No Autorizado" aquí
    return <Navigate to="/login" state={{ from: location, error: "You are not authorized to access this page." }} replace />;
  }

  // Si llegamos aquí, el usuario tiene sesión y es admin.
  console.log(`[ProtectedRoute] Access GRANTED for admin user (ID: ${user?.id}) to path: ${location.pathname}. Rendering children/Outlet.`);
  return children ? children : <Outlet />; 
};