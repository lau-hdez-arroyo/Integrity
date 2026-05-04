import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import AuthContext from '../context/AuthContext';
import { api } from '../services/api';

/**
 * PostLoginRedirect - Determina dónde ir después del login
 * - Si 1 proyecto: va al dashboard según rol
 * - Si múltiples: va a selección de proyectos
 * - Si ninguno: muestra error
 */
export default function PostLoginRedirect() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    handlePostLogin();
  }, [user]);

  const handlePostLogin = async () => {
    try {
      // Get user role from metadata
      const userRole = user?.user_metadata?.role || 'user';
      localStorage.setItem('userRole', userRole);

      // Get user's projects
      const projectsResponse = await api.get('/users/me/projects');
      const userProjects = projectsResponse.data.data || [];

      if (userProjects.length === 0) {
        // No projects - show error page
        navigate('/no-projects');
      } else if (userProjects.length === 1) {
        // Single project - go to dashboard based on role
        localStorage.setItem('selectedProject', JSON.stringify(userProjects[0]));
        redirectByRole(userRole);
      } else {
        // Multiple projects - go to selection page
        navigate('/project-selection');
      }
    } catch (err) {
      console.error('Error in post-login redirect:', err);
      // On error, go to project selection
      navigate('/project-selection');
    }
  };

  const redirectByRole = (role) => {
    const routes = {
      admin: '/admin',
      qa: '/dashboard/qa',
      developer: '/dashboard/developer',
      executive: '/dashboard/executive',
    };
    
    const destination = routes[role] || '/dashboard';
    navigate(destination);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
      }}
    >
      <CircularProgress sx={{ color: '#0d9488', marginBottom: 2 }} />
      <Typography sx={{ color: '#ffffff' }}>
        Preparing your dashboard...
      </Typography>
    </Box>
  );
}
