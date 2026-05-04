import React, { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load projects from localStorage
  useEffect(() => {
    const savedProject = localStorage.getItem('selectedProject');
    if (savedProject) {
      setSelectedProject(JSON.parse(savedProject));
    }
    setLoading(false);
  }, []);

  // Save to localStorage when project changes
  const selectProject = (project) => {
    setSelectedProject(project);
    localStorage.setItem('selectedProject', JSON.stringify(project));
  };

  const clearProject = () => {
    setSelectedProject(null);
    localStorage.removeItem('selectedProject');
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        projects,
        setProjects,
        selectProject,
        clearProject,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
