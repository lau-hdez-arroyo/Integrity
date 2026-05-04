import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { signIn } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('laura.hernandez@payflow.com');
  const [password, setPassword] = useState('Payflow@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Redirect to post-login handler which will determine destination based on projects
      setTimeout(() => {
        navigate('/post-login');
      }, 500);
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
            boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15)',
          }}
        >
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1e3a8a',
                marginBottom: 1,
              }}
            >
              INTEGRITY
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Intelligent Test Selection Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              disabled={loading}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              variant="outlined"
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                marginTop: 3,
                padding: '12px 0',
                backgroundColor: '#1e3a8a',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#153861',
                },
                '&:disabled': {
                  backgroundColor: '#999',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <Box sx={{ marginTop: 3, padding: 2, backgroundColor: '#f0f4f8', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', marginBottom: 1 }}>
              <strong>Demo Credentials:</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              • laura.hernandez@payflow.com
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
              • Password: Payflow@2026
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
