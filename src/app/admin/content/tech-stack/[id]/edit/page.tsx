import TechStackForm from '@/components/admin/TechStackForm';
import { getTechStack } from '@/lib/database/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';

export default async function EditTechStackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getAdminSelectedTenant();
  const techStack = await getTechStack(tenant);
  const tech = techStack.find(t => t.id === parseInt(id));
  
  if (!tech) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/admin/content" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Technology</h1>
        <p className="text-gray-400">Update details for {tech.name}</p>
      </div>

      <TechStackForm tech={tech} />
    </div>
  );
}