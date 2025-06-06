'use client';

import { useState } from 'react';
import { Trash2, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TechStackItem } from '@/lib/database/types';
import { adminFetch } from '@/lib/admin-fetch';

interface TechStackCardsProps {
  techStack: TechStackItem[];
}

export default function TechStackCards({ techStack }: TechStackCardsProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    
    try {
      const response = await adminFetch(`/api/admin/content/tech-stack/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      } else {
        alert('Failed to delete tech stack item');
      }
    } catch (error) {
      console.error('Error deleting tech stack:', error);
      alert('Failed to delete tech stack item');
    } finally {
      setDeletingId(null);
    }
  };

  if (techStack.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">No technologies added yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {techStack.map((tech) => (
        <div key={tech.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tech.icon}</span>
              <div>
                <h3 className="font-medium text-white">{tech.name}</h3>
                <p className="text-sm text-gray-400">{tech.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/content/tech-stack/${tech.id}/edit`}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-gray-400" />
              </Link>
              <button 
                onClick={() => tech.id && handleDelete(tech.id, tech.name)}
                disabled={deletingId === tech.id}
                className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className={`w-4 h-4 ${deletingId === tech.id ? 'text-gray-600' : 'text-gray-400 hover:text-red-400'}`} />
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Experience</span>
              <span className="text-white">{Number(tech.level).toFixed(1)} {Number(tech.level) === 1 ? 'year' : 'years'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}