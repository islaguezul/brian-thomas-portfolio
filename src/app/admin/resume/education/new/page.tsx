import EducationForm from '@/components/admin/EducationForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewEducationPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Add Education</h1>
        <p className="text-gray-400">Add a new education entry to your resume</p>
      </div>

      <EducationForm isNew />
    </div>
  );
}