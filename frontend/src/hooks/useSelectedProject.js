import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext';

export function useSelectedProject() {
  const navigate = useNavigate();
  const { selectedProject } = useContext(ProjectContext);

  useEffect(() => {
    if (!selectedProject) {
      navigate('/project-selection', { replace: true });
    }
  }, [selectedProject, navigate]);

  return selectedProject;
}
