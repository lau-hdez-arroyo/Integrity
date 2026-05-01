import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * Navigation - Sidebar and header navigation
 */
export default function Navigation() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Executive Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard/executive',
      color: '#1e3a8a',
    },
    {
      label: 'QA Dashboard',
      icon: <AnalyticsIcon />,
      path: '/dashboard/qa',
      color: '#0d9488',
    },
    {
      label: 'Developer Dashboard',
      icon: <AssignmentIcon />,
      path: '/dashboard/developer',
      color: '#06b6d4',
    },
    {
      label: 'Admin Panel',
      icon: <SecurityIcon />,
      path: '/admin',
      color: '#f59e0b',
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        color: '#ffffff',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6 0%, #0d9488 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          INTEGRITY
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Quality Dashboard
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, padding: '16px 0' }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                margin: '4px 12px',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                },
                '&.Mui-selected': {
                  backgroundColor: item.color,
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: item.color,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: '40px',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box
        sx={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingX: { xs: '16px', md: '24px' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              INTEGRITY
            </Typography>
          </Box>

          {/* User Menu */}
          <Box>
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{
                color: '#ffffff',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#0d9488',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                U
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem sx={{ color: '#0f172a', fontWeight: 500 }}>
                Profile
              </MenuItem>
              <MenuItem sx={{ color: '#0f172a', fontWeight: 500 }}>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: '#ef4444',
                  fontWeight: 600,
                }}
              >
                <LogoutIcon sx={{ marginRight: '8px' }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {!isMobile && <Drawer variant="permanent">{drawerContent}</Drawer>}
      {isMobile && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          marginLeft: { xs: 0, md: '280px' },
          marginTop: '64px',
          backgroundColor: '#f8fafc',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}
      />
    </Box>
  );
}
