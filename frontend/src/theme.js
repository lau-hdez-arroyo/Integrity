import { createTheme } from '@mui/material/styles';

/**
 * Professional & Modern Theme for INTEGRITY Dashboard
 * Colors: Navy + Teal + Modern Accent Colors
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a',      // Navy blue
      light: '#3b82f6',     // Bright blue
      dark: '#0f172a',      // Dark navy
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0d9488',      // Teal
      light: '#14b8a6',     // Light teal
      dark: '#0f766e',      // Dark teal
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',      // Emerald
      light: '#6ee7b7',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',      // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',      // Red
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#06b6d4',      // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#f8fafc',   // Light slate
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#0f172a',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1e293b',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#334155',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#64748b',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#78828f',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#334155',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
