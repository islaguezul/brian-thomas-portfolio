import EducationForm from '@/components/admin/EducationForm';
import { getEducation } from '@/lib/database/db';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditEducationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const educationList = await getEducation();
  const education = educationList.find(edu => edu.id === parseInt(id));
  
  if (!education) {
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
        <h1 className="text-3xl font-bold text-white mb-2">Edit Education</h1>
        <p className="text-gray-400">Update details for {education.degree} from {education.school}</p>
      </div>

      <EducationForm education={education} />
    </div>
  );
}