import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  GitHub as GitHubIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { ProjectContext } from '../context/ProjectContext';
import { api } from '../services/api';

export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const { projects, selectProject } = useContext(ProjectContext);
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjectsData(response.data.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project) => {
    selectProject(project);
    navigate('/dashboard');
  };

  const getProjectIcon = (projectName) => {
    const nameToColor = {
      'PayFlow Platform': '#1e3a8a',
      'Mobile Banking App': '#0d9488',
      'Payment Gateway': '#0891b2',
      'INTEGRITY Demo': '#f59e0b',
    };
    return nameToColor[projectName] || '#1e3a8a';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ marginBottom: '48px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Projects
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#64748b',
            fontSize: { xs: '0.95rem', md: '1rem' },
          }}
        >
          Manage and view all available projects
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : projectsData.length === 0 ? (
        <Alert severity="info">No projects available</Alert>
      ) : (
        <Grid container spacing={3}>
          {projectsData.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.project_id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: `2px solid ${getProjectIcon(project.name)}`,
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1, padding: '24px' }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      backgroundColor: `${getProjectIcon(project.name)}20`,
                      color: getProjectIcon(project.name),
                      marginBottom: '16px',
                    }}
                  >
                    <FolderIcon sx={{ fontSize: '2rem' }} />
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      marginBottom: '8px',
                      color: '#0f172a',
                      fontWeight: 700,
                    }}
                  >
                    {project.name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      marginBottom: '16px',
                      minHeight: '40px',
                    }}
                  >
                    {project.description || 'No description available'}
                  </Typography>

                  {/* Repository */}
                  <Box sx={{ marginBottom: '16px' }}>
                    <Chip
                      icon={<GitHubIcon />}
                      label={project.repository_url?.split('/').pop() || 'Repository'}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: getProjectIcon(project.name),
                        color: getProjectIcon(project.name),
                      }}
                    />
                  </Box>

                  {/* Stats */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '8px',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', display: 'block', marginBottom: '4px' }}
                      >
                        Status
                      </Typography>
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: '#64748b', display: 'block', marginBottom: '4px' }}
                      >
                        Created
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 600 }}>
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ padding: '16px 24px' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleSelectProject(project)}
                    sx={{
                      backgroundColor: getProjectIcon(project.name),
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: getProjectIcon(project.name),
                        opacity: 0.9,
                      },
                    }}
                  >
                    Select Project
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
