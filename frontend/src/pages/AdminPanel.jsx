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
  Chip,
  FormControlLabel,
  Switch,
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
  const [adoForm, setAdoForm] = useState({
    organizationUrl: '',
    adoProject: '',
    repositoryId: '',
    personalAccessToken: '',
  });
  const [openAdoDialog, setOpenAdoDialog] = useState(false);
  const [adoProjectTarget, setAdoProjectTarget] = useState(null);
  const [adoConfigByProject, setAdoConfigByProject] = useState({});
  const [adoSnapshotByProject, setAdoSnapshotByProject] = useState({});
  const [adoLoading, setAdoLoading] = useState(false);
  const [adoMessage, setAdoMessage] = useState(null);
  const [useAgentCredentials, setUseAgentCredentials] = useState(false);
  const [agentCredentialsConfigured, setAgentCredentialsConfigured] = useState(false);

  // Cargar proyectos al montar
  useEffect(() => {
    fetchProjects();
    fetchAgentCredentialsStatus();
  }, []);

  // NO cargar usuarios - solo proyectos por ahora
  // Members management coming soon

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      const projectRows = response.data.data || [];
      setProjects(projectRows);
      await fetchAdoStatusForProjects(projectRows);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentCredentialsStatus = async () => {
    try {
      const response = await api.get('/admin/ado/agent/status');
      setAgentCredentialsConfigured(Boolean(response.data?.data?.configured));
    } catch (_error) {
      setAgentCredentialsConfigured(false);
    }
  };

  const fetchAdoStatusForProjects = async (projectRows) => {
    const configs = {};
    const snapshots = {};

    await Promise.all(
      projectRows.map(async (project) => {
        const projectId = project.project_id;
        try {
          const [configResp, snapshotResp] = await Promise.all([
            api.get(`/admin/ado/config/${projectId}`),
            api.get(`/admin/ado/sync/${projectId}/latest`),
          ]);
          configs[projectId] = configResp.data?.data || { configured: false };
          snapshots[projectId] = snapshotResp.data?.data || null;
        } catch (_error) {
          configs[projectId] = { configured: false };
          snapshots[projectId] = null;
        }
      }),
    );

    setAdoConfigByProject(configs);
    setAdoSnapshotByProject(snapshots);
  };

  const refreshProjectAdoStatus = async (projectId) => {
    try {
      const [configResp, snapshotResp] = await Promise.all([
        api.get(`/admin/ado/config/${projectId}`),
        api.get(`/admin/ado/sync/${projectId}/latest`),
      ]);

      setAdoConfigByProject((prev) => ({
        ...prev,
        [projectId]: configResp.data?.data || { configured: false },
      }));

      setAdoSnapshotByProject((prev) => ({
        ...prev,
        [projectId]: snapshotResp.data?.data || null,
      }));
    } catch (_error) {
      // no-op on status refresh errors
    }
  };

  const fetchAdoConfig = async (projectId) => {
    try {
      const response = await api.get(`/admin/ado/config/${projectId}`);
      return response.data?.data;
    } catch (err) {
      console.error('Failed to load ADO config', err);
      return null;
    }
  };

  const openProjectAdoDialog = async (project) => {
    setAdoProjectTarget(project);
    setAdoMessage(null);
    setError(null);

    const config = await fetchAdoConfig(project.project_id);
    setAdoForm({
      organizationUrl: config?.organizationUrl || '',
      adoProject: config?.adoProject || '',
      repositoryId: config?.repositoryId || '',
      personalAccessToken: '',
    });
    setOpenAdoDialog(true);
  };

  const handleConnectAdo = async () => {
    const targetProjectId = adoProjectTarget?.project_id;

    if (!targetProjectId) {
      setError('Select a project first');
      return;
    }

    if (!useAgentCredentials && (!adoForm.organizationUrl || !adoForm.adoProject || !adoForm.personalAccessToken)) {
      setError('Organization URL, ADO project, and PAT are required');
      return;
    }

    try {
      setAdoLoading(true);
      setAdoMessage(null);

      await api.post('/admin/ado/connect', {
        projectId: targetProjectId,
        organizationUrl: adoForm.organizationUrl.trim(),
        adoProject: adoForm.adoProject.trim(),
        repositoryId: adoForm.repositoryId.trim() || null,
        personalAccessToken: adoForm.personalAccessToken.trim(),
        useAgentCredentials,
      });

      setAdoMessage({ type: 'success', text: 'ADO connection configured successfully' });
      setAdoForm((prev) => ({ ...prev, personalAccessToken: '' }));
      await refreshProjectAdoStatus(targetProjectId);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to connect to ADO');
    } finally {
      setAdoLoading(false);
    }
  };

  const handleSyncAdo = async (projectId) => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    try {
      setAdoLoading(true);
      setAdoMessage(null);

      const response = await api.post('/admin/ado/sync', { projectId });
      setAdoMessage({
        type: 'success',
        text: `Sync completed in ${response.data?.data?.durationMs || 0} ms`,
      });

      await refreshProjectAdoStatus(projectId);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to run ADO sync');
    } finally {
      setAdoLoading(false);
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
                      secondary={(
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: '4px', flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Repository: {project.repository_url || 'N/A'}
                          </Typography>
                          {adoConfigByProject[project.project_id]?.configured ? (
                            <Chip size="small" color="success" label="ADO Connected" />
                          ) : (
                            <Chip size="small" variant="outlined" label="ADO Not Connected" />
                          )}
                          {adoSnapshotByProject[project.project_id]?.synced_at && (
                            <Chip
                              size="small"
                              color="info"
                              variant="outlined"
                              label={`Last Sync: ${new Date(adoSnapshotByProject[project.project_id].synced_at).toLocaleDateString()}`}
                            />
                          )}
                        </Box>
                      )}
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
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openProjectAdoDialog(project)}
                        sx={{ marginRight: '8px', textTransform: 'none' }}
                      >
                        Connect ADO
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={!adoConfigByProject[project.project_id]?.configured || adoLoading}
                        onClick={() => handleSyncAdo(project.project_id)}
                        sx={{ marginRight: '8px', textTransform: 'none' }}
                      >
                        Sync
                      </Button>
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

      {/* ADO Dialog */}
      <Dialog open={openAdoDialog} onClose={() => setOpenAdoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Connect Azure DevOps - {adoProjectTarget?.name || 'Project'}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '24px' }}>
          {adoMessage && (
            <Alert severity={adoMessage.type} sx={{ marginBottom: '16px' }}>
              {adoMessage.text}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: '#64748b', marginBottom: '8px' }}>
            Project repository URL: {adoProjectTarget?.repository_url || 'N/A'}
          </Typography>

          <FormControlLabel
            sx={{ marginBottom: '12px' }}
            control={(
              <Switch
                checked={useAgentCredentials}
                onChange={(e) => setUseAgentCredentials(e.target.checked)}
                disabled={!agentCredentialsConfigured}
              />
            )}
            label={agentCredentialsConfigured
              ? 'Use secure server agent credentials'
              : 'Server agent credentials are not configured'}
          />

          <Grid container spacing={2} sx={{ marginBottom: '12px' }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Organization URL"
                fullWidth
                value={adoForm.organizationUrl}
                onChange={(e) => setAdoForm({ ...adoForm, organizationUrl: e.target.value })}
                placeholder="https://dev.azure.com/your-org"
                disabled={useAgentCredentials}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="ADO Project"
                fullWidth
                value={adoForm.adoProject}
                onChange={(e) => setAdoForm({ ...adoForm, adoProject: e.target.value })}
                placeholder="ProjectName"
                disabled={useAgentCredentials}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Repository ID (optional)"
                fullWidth
                value={adoForm.repositoryId}
                onChange={(e) => setAdoForm({ ...adoForm, repositoryId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Personal Access Token"
                fullWidth
                type="password"
                value={adoForm.personalAccessToken}
                onChange={(e) => setAdoForm({ ...adoForm, personalAccessToken: e.target.value })}
                placeholder="Paste PAT"
                disabled={useAgentCredentials}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdoDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handleConnectAdo} disabled={adoLoading}>
            {adoLoading ? 'Connecting...' : 'Save ADO Connection'}
          </Button>
        </DialogActions>
      </Dialog>

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
