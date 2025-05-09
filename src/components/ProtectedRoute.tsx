"use client";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/Loading";

export const ProtectedRoute = ({ children }: { children?: JSX.Element }) => {
  const { session, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Optionally, redirect to a "Not Authorized" page or back to login with a message
    console.warn("User is not an admin. Redirecting to login.");
    return <Navigate to="/login" state={{ from: location, error: "Not authorized" }} replace />;
  }

  return children ? children : <Outlet />; // Render children or Outlet for nested routes
};