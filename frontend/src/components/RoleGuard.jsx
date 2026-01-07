import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { ROLES } from 'config';

const RoleGuard = ({ children, pageKey, redirectTo = '/dashboard/default' }) => {
  const { user, loading } = useAuth();

  // Show loading only if we're still loading AND don't have a user
  // If we have a user (even from localStorage), proceed with permission check
  if (loading && !user) {
    return <div>Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to all pages
  if (user.role === ROLES.ADMIN) {
    return children;
  }

  // Dashboard is accessible to all authenticated users
  if (pageKey === 'dashboard') {
    return children;
  }

  // For users, check if pageKey is in their pagePermissions
  if (user.role === ROLES.USER && user.pagePermissions && user.pagePermissions.includes(pageKey)) {
    return children;
  }

  // No access, redirect
  return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;
