'use client'

import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

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
      <div className="grid gap-8 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={handleProjectSelect}
          />
        ))}
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ProjectList;