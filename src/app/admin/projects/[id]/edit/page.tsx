import ProjectForm from '@/components/admin/ProjectForm';
import { getProject } from '@/lib/database/db';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getAdminSelectedTenant();
  const project = await getProject(tenant, parseInt(id));
  
  if (!project) {
    notFound();
  }

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
        <h1 className="text-3xl font-bold text-white mb-2">Edit Project</h1>
        <p className="text-gray-400">Update project details for {project.name}</p>
      </div>

      <ProjectForm project={project} />
    </div>
  );
}