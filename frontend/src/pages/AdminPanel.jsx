import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { useSelectedProject } from '../hooks/useSelectedProject';
import { api } from '../services/api';

/**
 * AdminPanel - Project and system administration
 */
export default function AdminPanel() {
  const selectedProject = useSelectedProject();
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', repo: '' });

  // Cargar proyectos al montar
  useEffect(() => {
    fetchProjects();
  }, []);

  // NO cargar usuarios - solo proyectos por ahora
  // Members management coming soon

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setFormData({ name: '', repo: '' });
    setOpenDialog(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, repo: project.repository_url || '' });
    setOpenDialog(true);
  };

  const handleSaveProject = async () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingProject) {
        // Actualizar proyecto
        await api.put(`/projects/${editingProject.project_id}`, {
          name: formData.name,
          repository_url: formData.repo,
        });
      } else {
        // Crear nuevo proyecto
        await api.post('/projects', {
          name: formData.name,
          repository_url: formData.repo,
        });
      }
      await fetchProjects();
      setOpenDialog(false);
      setFormData({ name: '', repo: '' });
      setEditingProject(null);
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${projectId}`);
        await fetchProjects();
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: '24px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography
          variant="h2"
          sx={{
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Admin Panel
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
          System configuration and project management
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '32px' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Projects" />
        </Tabs>
      </Box>

      {/* TAB 0: Projects Management */}
      {activeTab === 0 && (
        <Box>
          {/* Project Stats */}
          <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Projects"
                value={projects.length}
                color="primary"
                icon={<AdminPanelSettingsIcon sx={{ fontSize: '1.5rem' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Users"
                value="24"
                color="success"
                icon={<AdminPanelSettingsIcon sx={{ fontSize: '1.5rem' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="System Health"
                value="99.9%"
                color="info"
                progress={99}
                icon={<AdminPanelSettingsIcon sx={{ fontSize: '1.5rem' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="API Uptime"
                value="100%"
                color="success"
                icon={<AdminPanelSettingsIcon sx={{ fontSize: '1.5rem' }} />}
              />
            </Grid>
          </Grid>

          {/* Project Management */}
          <ChartCard
            title="Project Management"
            subtitle="Manage projects and integrations"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProject}
                sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Add Project
              </Button>
            }
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <CircularProgress />
              </Box>
            ) : projects.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                No projects found. Create one to get started.
              </Typography>
            ) : (
              <List>
                {projects.map((project) => (
                  <ListItem
                    key={project.project_id}
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <ListItemText
                      primary={project.name}
                      secondary={`Repository: ${project.repository_url || 'N/A'}`}
                      primaryTypographyProps={{
                        variant: 'body1',
                        sx: { fontWeight: 600, color: '#0f172a' },
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        sx: { color: '#64748b' },
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditProject(project)}
                        sx={{ marginRight: '8px', color: '#1e3a8a' }}
                        title="Edit project"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteProject(project.project_id)}
                        sx={{ color: '#ef4444' }}
                        title="Delete project"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </ChartCard>
        </Box>
      )}

      {/* Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        <DialogContent sx={{ paddingTop: '24px' }}>
          <TextField
            autoFocus
            label="Project Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Repository URL"
            fullWidth
            value={formData.repo}
            onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
            margin="normal"
            placeholder="https://github.com/..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProject} disabled={loading}>
            {editingProject ? 'Update' : 'Add'} Project
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
