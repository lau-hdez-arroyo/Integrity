import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Menu, MenuItem, Typography, CircularProgress } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { ProjectContext } from '../context/ProjectContext';

export default function ProjectSelector() {
  const navigate = useNavigate();
  const { selectedProject, projects, selectProject, loading } = useContext(ProjectContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectProject = (project) => {
    selectProject(project);
    handleClose();
    navigate('/dashboard');
  };

  // No render if only one project or no selected project
  if (!selectedProject || projects.length <= 1) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FolderOpenIcon sx={{ color: '#0d9488' }} />
      <Button
        onClick={handleOpen}
        endIcon={<ExpandMoreIcon />}
        sx={{
          textTransform: 'none',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.95rem',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        title="Click to switch projects"
      >
        {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : selectedProject.name}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {projects.map((project) => (
          <MenuItem
            key={project.project_id}
            onClick={() => handleSelectProject(project)}
            selected={project.project_id === selectedProject.project_id}
            sx={{
              backgroundColor: project.project_id === selectedProject.project_id 
                ? 'rgba(13, 148, 136, 0.1)' 
                : 'transparent',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: project.project_id === selectedProject.project_id ? 600 : 500,
                color: project.project_id === selectedProject.project_id ? '#0d9488' : '#0f172a',
              }}
            >
              {project.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
