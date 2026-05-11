import { useRoutes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import PostLoginRedirect from './pages/PostLoginRedirect';
import ProjectSelection from './pages/ProjectSelection';
import NoProjects from './pages/NoProjects';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import QADashboard from './pages/QADashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import ProjectsDashboard from './pages/ProjectsDashboard';
import NarniaImage from './pages/NarniaImage';

// INTEGRITY App with full routing
export default function App() {
  const routes = useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/post-login',
      element: <PostLoginRedirect />,
    },
    {
      path: '/no-projects',
      element: <NoProjects />,
    },
    {
      path: '/project-selection',
      element: (
        <ProtectedRoute>
          <ProjectSelection />
        </ProtectedRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ErrorBoundary>
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        </ErrorBoundary>
      ),
      children: [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <ErrorBoundary><Dashboard /></ErrorBoundary> },
        { path: 'projects', element: <ErrorBoundary><ProjectsDashboard /></ErrorBoundary> },
        {
          path: 'dashboard/executive',
          element: (
            <ErrorBoundary>
              <RoleProtectedRoute allowedRoles={['admin', 'executive']}>
                <ExecutiveDashboard />
              </RoleProtectedRoute>
            </ErrorBoundary>
          ),
        },
        {
          path: 'dashboard/qa',
          element: (
            <ErrorBoundary>
              <RoleProtectedRoute allowedRoles={['admin', 'qa']}>
                <QADashboard />
              </RoleProtectedRoute>
            </ErrorBoundary>
          ),
        },
        {
          path: 'dashboard/developer',
          element: (
            <ErrorBoundary>
              <RoleProtectedRoute allowedRoles={['admin', 'developer']}>
                <DeveloperDashboard />
              </RoleProtectedRoute>
            </ErrorBoundary>
          ),
        },
        {
          path: 'admin',
          element: (
            <ErrorBoundary>
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </RoleProtectedRoute>
            </ErrorBoundary>
          ),
        },
        {
          path: 'narnia-image',
          element: (
            <ErrorBoundary>
              <NarniaImage />
            </ErrorBoundary>
          ),
        },
      ],
    },
  ]);

  return routes;
}
