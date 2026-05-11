import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import paladinImage from '../assets/paladin.png';

export default function NarniaImage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ marginBottom: '24px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Narnia Image
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          Visual reference loaded from project assets.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: { xs: '12px', md: '24px' },
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          component="img"
          src={paladinImage}
          alt="Paladin"
          sx={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
      </Box>
    </Container>
  );
}
