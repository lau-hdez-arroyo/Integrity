import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';

export default function NoProjects() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
          }}
        >
          <WarningIcon
            sx={{
              fontSize: '4rem',
              color: '#f59e0b',
              marginBottom: 2,
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e3a8a',
              marginBottom: 1,
            }}
          >
            No Projects Available
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#666',
              marginBottom: 3,
              lineHeight: 1.6,
            }}
          >
            You don't have access to any projects yet. Please contact your administrator to assign you to a project.
          </Typography>

          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              backgroundColor: '#1e3a8a',
              color: '#fff',
              fontWeight: 600,
              padding: '10px 24px',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#1a2f6e',
              },
            }}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
