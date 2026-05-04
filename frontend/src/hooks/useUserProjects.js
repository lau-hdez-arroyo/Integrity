import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * useUserProjects - Obtiene proyectos del usuario y gestiona el flujo post-login
 * Retorna: { projects, loading, error, userRole }
 */
export function useUserProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get user info (including role)
      const userResponse = await api.get('/users/me');
      const role = userResponse.data.data.role;
      setUserRole(role);

      // Get user's projects
      const projectsResponse = await api.get('/users/me/projects');
      const userProjects = projectsResponse.data.data || [];
      setProjects(userProjects);

      // Determine redirect based on number of projects
      if (userProjects.length === 1) {
        // Single project: redirect to dashboard based on role
        localStorage.setItem('selectedProject', JSON.stringify(userProjects[0]));
        redirectToDashboardByRole(role);
      } else if (userProjects.length > 1) {
        // Multiple projects: show selection page
        navigate('/project-selection');
      } else {
        // No projects assigned
        setError('No projects assigned to your account');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboardByRole = (role) => {
    const dashboardMap = {
      admin: '/dashboard',
      qa: '/dashboard/qa',
      developer: '/dashboard/developer',
      executive: '/dashboard/executive',
    };
    
    const dashboard = dashboardMap[role] || '/dashboard';
    navigate(dashboard);
  };

  return { projects, userRole, loading, error };
}
