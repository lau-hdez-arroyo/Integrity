import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import AuthContext from '../context/AuthContext';

/**
 * RoleProtectedRoute - Protege rutas según el rol del usuario
 * Solo deja pasar si el rol del usuario está en la lista de roles permitidos
 */
export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { user, userRole } = useContext(AuthContext);
  
  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Obtener el rol del usuario desde localStorage o metadata
  const effectiveRole = String(userRole || localStorage.getItem('userRole') || 'user').trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).trim().toLowerCase());
  
  // Si la lista de roles permitidos está vacía, permitir acceso
  if (normalizedAllowedRoles.length === 0) {
    return children;
  }

  // Verificar si el rol está en la lista de roles permitidos
  if (!normalizedAllowedRoles.includes(effectiveRole)) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Box sx={{ marginY: 4 }}>
          <Typography variant="h4" sx={{ color: '#ef4444', marginBottom: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            You don't have permission to access this page. Your role: {effectiveRole}
          </Typography>
        </Box>
      </Container>
    );
  }

  return children;
}
