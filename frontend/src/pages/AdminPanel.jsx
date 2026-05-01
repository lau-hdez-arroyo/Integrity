import React, { useState } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';

/**
 * AdminPanel - Project and system administration
 */
export default function AdminPanel() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'E-commerce Platform',
      repo: 'https://github.com/company/ecommerce',
      created: '2026-01-15',
      status: 'active',
    },
    {
      id: 2,
      name: 'Analytics Dashboard',
      repo: 'https://github.com/company/analytics',
      created: '2026-02-01',
      status: 'active',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', repo: '' });

  const handleAddProject = () => {
    if (newProject.name && newProject.repo) {
      setProjects([
        ...projects,
        {
          id: Math.max(...projects.map(p => p.id)) + 1,
          ...newProject,
          created: new Date().toISOString().split('T')[0],
          status: 'active',
        },
      ]);
      setNewProject({ name: '', repo: '' });
      setOpenDialog(false);
    }
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <Container maxWidth="lg">
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

      {/* Admin Stats */}
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
      <Grid item xs={12} sx={{ marginBottom: '32px' }}>
        <ChartCard
          title="Project Management"
          subtitle="Manage projects and integrations"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
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
          <List>
            {projects.map((project) => (
              <ListItem
                key={project.id}
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
                  secondary={`Repository: ${project.repo}`}
                  primaryTypographyProps={{
                    variant: 'body1',
                    sx={{ fontWeight: 600, color: '#0f172a' },
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx={{ color: '#64748b' },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => {}}
                    sx={{ marginRight: '8px', color: '#1e3a8a' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteProject(project.id)}
                    sx={{ color: '#ef4444' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </ChartCard>
      </Grid>

      {/* Configuration */}
      <Grid item xs={12}>
        <ChartCard title="System Configuration" subtitle="Global settings">
          <Alert severity="info" sx={{ marginBottom: '16px' }}>
            Configuration changes will affect all projects. Please review carefully.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Webhook Secret"
              type="password"
              fullWidth
              value="••••••••••••••••"
              InputProps={{ readOnly: true }}
              size="small"
            />

            <TextField
              label="Max Test Execution Time (seconds)"
              type="number"
              fullWidth
              defaultValue={300}
              size="small"
            />

            <TextField
              label="Default Risk Tolerance"
              select
              fullWidth
              defaultValue="BALANCED"
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="AGGRESSIVE">Aggressive</option>
              <option value="BALANCED">Balanced</option>
              <option value="CONSERVATIVE">Conservative</option>
            </TextField>

            <Box sx={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Save Configuration
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Reset to Defaults
              </Button>
            </Box>
          </Box>
        </ChartCard>
      </Grid>

      {/* Add Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent sx={{ paddingTop: '24px' }}>
          <TextField
            autoFocus
            label="Project Name"
            fullWidth
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Repository URL"
            fullWidth
            value={newProject.repo}
            onChange={(e) => setNewProject({ ...newProject, repo: e.target.value })}
            margin="normal"
            placeholder="https://github.com/..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProject}>
            Add Project
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
