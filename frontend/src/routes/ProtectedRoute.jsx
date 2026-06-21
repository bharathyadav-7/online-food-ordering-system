import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ requireAdmin = false, requireRoles = [] }) {
  const { isAuthed, isAdmin, user } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireRoles.length > 0 && !requireRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

