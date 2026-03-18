'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-fetch';
import type { CaseStudy } from '@/lib/database/types';

export default function AdminCaseStudies() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadCaseStudies();
  }, []);

  async function loadCaseStudies() {
    try {
      const response = await adminFetch('/api/admin/case-studies');
      if (response.ok) {
        setCaseStudies(await response.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const response = await adminFetch(`/api/admin/case-studies/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCaseStudies((prev) => prev.filter((cs) => cs.id !== id));
      } else {
        alert('Failed to delete case study');
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-400">Loading case studies...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Case Studies</h1>
        <Link
          href="/admin/case-studies/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          + New Case Study
        </Link>
      </div>

      {caseStudies.length === 0 ? (
        <div className="text-gray-400">No case studies yet.</div>
      ) : (
        <div className="space-y-4">
          {caseStudies.map((cs) => (
            <div
              key={cs.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-medium">{cs.title}</h3>
                  {cs.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 border border-blue-800/50">
                      {cs.category}
                    </span>
                  )}
                  {!cs.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1 line-clamp-1">{cs.summary}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  {cs.industry && <span>{cs.industry}</span>}
                  {cs.timeline && <span>{cs.timeline}</span>}
                  <span>{cs.outcomes?.length || 0} outcomes</span>
                  <span>{cs.approaches?.length || 0} approach steps</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/case-studies/${cs.id}/edit`}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(cs.id!, cs.title!)}
                  disabled={deletingId === cs.id}
                  className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded text-sm disabled:opacity-50"
                >
                  {deletingId === cs.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
