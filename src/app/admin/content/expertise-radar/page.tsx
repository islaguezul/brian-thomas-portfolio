import { sql } from '@vercel/postgres';
import { Target, Plus, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';

interface ExpertiseRadarItem {
  id: number;
  tenantId: string;
  skillName: string;
  skillLevel: number;
  category?: string;
  description?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

async function getExpertiseRadarItems(tenant: string): Promise<ExpertiseRadarItem[]> {
  try {
    const result = await sql`
      SELECT * FROM expertise_radar 
      WHERE tenant_id = ${tenant}
      ORDER BY display_order ASC, skill_name ASC
    `;
    return result.rows as ExpertiseRadarItem[];
  } catch (error) {
    console.error('Error fetching expertise radar items:', error);
    return [];
  }
}

export default async function ExpertiseRadarPage() {
  const tenant = await getAdminSelectedTenant();
  const expertiseItems = await getExpertiseRadarItems(tenant);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Expertise Radar</h1>
        <p className="text-gray-400">Manage your expertise radar visualization data</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Content
          </Link>
        </div>
        <Link
          href="/admin/content/expertise-radar/new"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expertise
        </Link>
      </div>

      {expertiseItems.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Expertise Items</h3>
          <p className="text-gray-400 mb-4">Start building your expertise radar by adding skills and competencies.</p>
          <Link
            href="/admin/content/expertise-radar/new"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Expertise
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expertiseItems.map((item) => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{item.skillName}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(item.skillLevel / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 min-w-[3rem]">
                        {item.skillLevel}/10
                      </span>
                    </div>
                    {item.category && (
                      <span className="inline-block bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Link
                      href={`/admin/content/expertise-radar/${item.id}/edit`}
                      className="p-1 hover:bg-gray-800 rounded transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </Link>
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-400">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}