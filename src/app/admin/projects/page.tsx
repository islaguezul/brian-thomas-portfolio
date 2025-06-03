import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Github, Eye, EyeOff } from 'lucide-react';
import { getProjects } from '@/lib/database/db';

export default async function ProjectsPage() {
  const projects = await getProjects();

  const getStageColor = (stage: string) => {
    const colors = {
      production: 'bg-green-500/20 text-green-400 border-green-500/30',
      mvp: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      backend: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      concept: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      research: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      legacy: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[stage as keyof typeof colors] || colors.concept;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Manage your portfolio projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Link>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">No projects yet</p>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Project
            </Link>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStageColor(project.stage)}`}>
                      {project.stage}
                    </span>
                    {project.experimental && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Experimental
                      </span>
                    )}
                    {project.legacy && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        Legacy
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies?.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600">
                        <EyeOff className="w-4 h-4" />
                        <span>No GitHub Link</span>
                      </span>
                    )}
                    
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Live Demo</span>
                      </a>
                    )}

                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{project.progress}% Complete</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit project"
                  >
                    <Edit className="w-4 h-4 text-gray-300" />
                  </Link>
                  <button
                    className="p-2 bg-gray-800 hover:bg-red-900/50 rounded-lg transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
                  </button>
                </div>
              </div>

              {project.features && project.features.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-sm font-medium text-gray-400 mb-2">Key Features:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {project.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{feature.feature}</span>
                      </li>
                    ))}
                    {project.features.length > 3 && (
                      <li className="text-gray-600 italic">
                        +{project.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}