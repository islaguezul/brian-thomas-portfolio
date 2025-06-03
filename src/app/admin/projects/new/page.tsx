import ProjectForm from '@/components/admin/ProjectForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/admin/projects" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
        <p className="text-gray-400">Add a new project to your portfolio</p>
      </div>

      <ProjectForm isNew />
    </div>
  );
}