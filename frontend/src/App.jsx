import { useRoutes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import QADashboard from './pages/QADashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';

export default function App() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <Dashboard /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'dashboard/executive', element: <ExecutiveDashboard /> },
        { path: 'dashboard/qa', element: <QADashboard /> },
        { path: 'dashboard/developer', element: <DeveloperDashboard /> },
        { path: 'admin', element: <AdminPanel /> },
      ],
    },
    { path: '/login', element: <Login /> },
  ]);

  return routes;
}
