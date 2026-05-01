import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Navigation from './Navigation';

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          marginLeft: { xs: 0, md: '280px' },
          marginTop: '64px',
          padding: { xs: '16px', sm: '24px', md: '32px' },
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
