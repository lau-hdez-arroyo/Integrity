import { useRoutes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import QADashboard from './pages/QADashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';

// INTEGRITY App with full routing
export default function App() {
  const routes = useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'dashboard/executive', element: <ExecutiveDashboard /> },
        { path: 'dashboard/qa', element: <QADashboard /> },
        { path: 'dashboard/developer', element: <DeveloperDashboard /> },
        { path: 'admin', element: <AdminPanel /> },
      ],
    },
  ]);

  return routes;
}
