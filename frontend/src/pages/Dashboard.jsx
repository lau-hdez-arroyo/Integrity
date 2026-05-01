import { useContext } from 'react';
import { Box, Container, Button } from '@mui/material';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <h1>Dashboard</h1>
        <Button variant="contained" color="error" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {/* Dashboard widgets go here */}
        <div>Executive Dashboard</div>
        <div>QA Dashboard</div>
      </Box>
    </Container>
  );
}
