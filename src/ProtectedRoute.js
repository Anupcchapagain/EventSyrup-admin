// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
