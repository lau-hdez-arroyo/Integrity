import { useRoutes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: 'dashboard', element: <Dashboard /> },
      ],
    },
    { path: '/login', element: <Login /> },
  ]);

  return routes;
}
