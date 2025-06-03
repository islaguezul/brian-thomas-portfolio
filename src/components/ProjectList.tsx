'use client'

import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import LegacyProjectModal from './LegacyProjectModal';

interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
  tech: string[];
  stage: string;
  progress: number;
  impact: Record<string, string | undefined>;
  features: string[];
  experimental: boolean;
  legacy?: boolean;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectSelect = (project: Project): void => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <>
      <div className={`grid gap-8 ${
        projects.length === 1 
          ? 'max-w-2xl mx-auto' 
          : projects.length === 2 
          ? 'lg:grid-cols-2' 
          : projects.length === 3 
          ? 'lg:grid-cols-3' 
          : projects.length >= 4 
          ? 'lg:grid-cols-2 xl:grid-cols-3' 
          : ''
      }`}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={handleProjectSelect}
          />
        ))}
      </div>

      {selectedProject?.legacy ? (
        <LegacyProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      ) : (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ProjectList;