import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const roleDashboards = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const getDashboardForRole = (role) => roleDashboards[normalizeRole(role)] || '/';

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const user = getStoredUser();
  const role = normalizeRole(user?.role);
  const allowed = allowedRoles.map(normalizeRole);

  if (!user || !role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!allowed.includes(role)) {
    return <Navigate to={getDashboardForRole(role)} replace />;
  }

  return children;
}
