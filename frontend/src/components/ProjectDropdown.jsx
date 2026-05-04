import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FolderOpen as FolderOpenIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { ProjectContext } from '../context/ProjectContext';

export default function ProjectDropdown() {
  const navigate = useNavigate();
  const { selectedProject, projects, selectProject } = useContext(ProjectContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectProject = (project) => {
    selectProject(project);
    handleClose();
    // Stay on current page, just update context
  };

  const handleSwitchProject = () => {
    handleClose();
    navigate('/project-selection');
  };

  if (!selectedProject || projects.length <= 1) return null;

  return (
    <Box>
      <Button
        onClick={handleOpen}
        startIcon={<FolderOpenIcon />}
        endIcon={<ExpandMoreIcon />}
        sx={{
          textTransform: 'none',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.9rem',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        title="Switch project"
      >
        {selectedProject.name}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
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
        <MenuItem disabled sx={{ padding: '8px 16px' }}>
          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
            YOUR PROJECTS ({projects.length})
          </Typography>
        </MenuItem>

        <Divider />

        {projects.map((project) => (
          <MenuItem
            key={project.project_id}
            onClick={() => handleSelectProject(project)}
            selected={project.project_id === selectedProject.project_id}
            sx={{
              backgroundColor:
                project.project_id === selectedProject.project_id
                  ? 'rgba(13, 148, 136, 0.1)'
                  : 'transparent',
              paddingX: '16px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight:
                      project.project_id === selectedProject.project_id ? 600 : 500,
                    color:
                      project.project_id === selectedProject.project_id
                        ? '#0d9488'
                        : '#0f172a',
                  }}
                >
                  {project.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#999', display: 'block', marginTop: '2px' }}
                >
                  {project.repository_url?.split('/').pop() || 'No repo'}
                </Typography>
              </Box>
              {project.project_id === selectedProject.project_id && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    height: '20px',
                    marginLeft: '8px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </MenuItem>
        ))}

        <Divider sx={{ marginY: '8px' }} />

        <MenuItem
          onClick={handleSwitchProject}
          sx={{
            color: '#0d9488',
            fontWeight: 600,
          }}
        >
          <SwapHorizIcon sx={{ marginRight: '8px', fontSize: '1.1rem' }} />
          Switch Project
        </MenuItem>
      </Menu>
    </Box>
  );
}
