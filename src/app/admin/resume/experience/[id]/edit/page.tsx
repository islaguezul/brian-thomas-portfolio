import ExperienceForm from '@/components/admin/ExperienceForm';
import { getWorkExperience } from '@/lib/database/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getAdminSelectedTenant();
  const experiences = await getWorkExperience(tenant);
  const experience = experiences.find(exp => exp.id === parseInt(id));
  
  if (!experience) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/admin/resume" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resume
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Work Experience</h1>
        <p className="text-gray-400">Update details for {experience.title} at {experience.company}</p>
      </div>

      <ExperienceForm experience={experience} />
    </div>
  );
}