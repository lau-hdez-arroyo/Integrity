import { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!user) {
    return <Navigate to="/login" />;
  }

  const dashboards = [
    {
      title: 'Executive Dashboard',
      description: 'High-level KPIs and business metrics for leadership',
      icon: <DashboardIcon sx={{ fontSize: '3rem' }} />,
      color: '#1e3a8a',
      path: '/dashboard/executive',
      features: ['Quality Score', 'Velocity Trends', 'Release Metrics'],
    },
    {
      title: 'QA Dashboard',
      description: 'Test execution metrics and coverage analysis',
      icon: <AnalyticsIcon sx={{ fontSize: '3rem' }} />,
      color: '#0d9488',
      path: '/dashboard/qa',
      features: ['Test Coverage', 'Execution Metrics', 'Flaky Tests'],
    },
    {
      title: 'Developer Dashboard',
      description: 'Personal productivity and code quality metrics',
      icon: <CodeIcon sx={{ fontSize: '3rem' }} />,
      color: '#06b6d4',
      path: '/dashboard/developer',
      features: ['Code Quality', 'Pull Requests', 'Defect Tracking'],
    },
    {
      title: 'Admin Panel',
      description: 'System configuration and project management',
      icon: <SecurityIcon sx={{ fontSize: '3rem' }} />,
      color: '#f59e0b',
      path: '/admin',
      features: ['Project Management', 'Settings', 'System Health'],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', marginBottom: '64px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Welcome to INTEGRITY
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: '#64748b',
            marginBottom: '24px',
            fontWeight: 400,
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          Comprehensive Quality Management Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#94a3b8',
            maxWidth: '600px',
            marginX: 'auto',
            fontSize: { xs: '0.95rem', md: '1rem' },
          }}
        >
          Select your role below to access personalized dashboards with real-time metrics, insights,
          and actionable recommendations for your team.
        </Typography>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        {dashboards.map((dashboard) => (
          <Grid item xs={12} sm={6} md={6} key={dashboard.path}>
            <Card
              onClick={() => navigate(dashboard.path)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
                  borderColor: dashboard.color,
                },
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '32px 24px',
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    backgroundColor: `rgba(${parseInt(dashboard.color.slice(1, 3), 16)}, ${parseInt(dashboard.color.slice(3, 5), 16)}, ${parseInt(dashboard.color.slice(5, 7), 16)}, 0.1)`,
                    color: dashboard.color,
                    marginBottom: '16px',
                  }}
                >
                  {dashboard.icon}
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  sx={{
                    marginBottom: '8px',
                    color: '#0f172a',
                    fontWeight: 700,
                  }}
                >
                  {dashboard.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    marginBottom: '16px',
                    flex: 1,
                  }}
                >
                  {dashboard.description}
                </Typography>

                {/* Features */}
                <Box sx={{ marginBottom: '24px' }}>
                  {dashboard.features.map((feature, idx) => (
                    <Typography
                      key={idx}
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#64748b',
                        marginBottom: '4px',
                        '&:before': {
                          content: '"✓"',
                          marginRight: '8px',
                          color: dashboard.color,
                          fontWeight: 700,
                        },
                      }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>

                {/* Button */}
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: dashboard.color,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 16px',
                    '&:hover': {
                      backgroundColor: dashboard.color,
                      opacity: 0.9,
                    },
                  }}
                >
                  Access Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ marginTop: '64px', textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ color: '#64748b', marginBottom: '24px' }}>
          SYSTEM STATUS
        </Typography>
        <Grid container spacing={2} sx={{ maxWidth: '600px', marginX: 'auto' }}>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                100%
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                API Uptime
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                24
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Active Users
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                2
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Projects
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                99.9%
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Health Score
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
