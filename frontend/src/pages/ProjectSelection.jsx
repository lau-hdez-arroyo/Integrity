import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import { ProjectContext } from '../context/ProjectContext';
import { api } from '../services/api';

export default function ProjectSelection() {
  const navigate = useNavigate();
  const { selectProject, setProjects } = useContext(ProjectContext);
  const [projects, setLocalProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      console.log('Projects fetched:', response.data);
      const projectList = response.data.data || [];
      setLocalProjects(projectList);
      setProjects(projectList);

      // If only 1 project, auto-select it
      if (projectList.length === 1) {
        selectProject(projectList[0]);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project) => {
    selectProject(project);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ padding: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="contained" onClick={fetchProjects} sx={{ marginTop: 2 }}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  if (projects.length === 0) {
    return (
      <Container>
        <Box sx={{ padding: 4, textAlign: 'center' }}>
          <Alert severity="info">No projects available. Please contact your administrator.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: 4 }}>
        {/* Header */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#1e3a8a',
              marginBottom: 1,
            }}
          >
            Select a Project
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Choose a project to view its dashboards and metrics
          </Typography>
        </Box>

        {/* Project Cards Grid */}
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.project_id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(30, 58, 138, 0.15)',
                    transform: 'translateY(-4px)',
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => handleSelectProject(project)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <FolderOpenIcon sx={{ fontSize: 40, color: '#0d9488', marginRight: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {project.name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#64748b', marginBottom: 2 }}>
                    {project.repository_url || 'No repository configured'}
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: '#1e3a8a',
                      '&:hover': {
                        backgroundColor: '#153861',
                      },
                    }}
                  >
                    Select Project
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
