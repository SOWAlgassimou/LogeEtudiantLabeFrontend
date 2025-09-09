import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
