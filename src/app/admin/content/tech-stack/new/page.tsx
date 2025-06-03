import TechStackForm from '@/components/admin/TechStackForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTechStackPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Add Technology</h1>
        <p className="text-gray-400">Add a new technology to your tech stack</p>
      </div>

      <TechStackForm isNew />
    </div>
  );
}