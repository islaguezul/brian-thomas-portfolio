import { sql } from '@vercel/postgres';
import { Award, Plus, Edit2, Trash2 } from 'lucide-react';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';
import Link from 'next/link';

async function getKeyAchievements() {
  try {
    const tenant = await getAdminSelectedTenant();
    
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'key_achievements'
      );
    `;
    
    if (!tableExists.rows[0].exists) {
      return [];
    }
    
    const result = await sql`
      SELECT * FROM key_achievements 
      WHERE tenant_id = ${tenant}
      ORDER BY display_order, achievement_date DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

async function getProductMetricsSummary() {
  try {
    const tenant = await getAdminSelectedTenant();
    
    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_metrics_summary'
      );
    `;
    
    if (!tableExists.rows[0].exists) {
      return null;
    }
    
    const result = await sql`
      SELECT * FROM product_metrics_summary 
      WHERE tenant_id = ${tenant}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    return null;
  }
}

async function checkTablesExist() {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('key_achievements', 'product_metrics_summary')
      );
    `;
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

export default async function MetricsPage() {
  const tablesExist = await checkTablesExist();
  
  if (!tablesExist) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Metrics Management</h1>
          <p className="text-gray-400">Track your impact and achievements as a product leader</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Tables Not Yet Created</h2>
          <p className="text-gray-400 mb-6">
            The product metrics tables need to be created before you can start tracking achievements.
          </p>
          <Link
            href="/admin/database"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Database to Create Tables
          </Link>
        </div>
      </div>
    );
  }
  
  const achievements = await getKeyAchievements();
  const metricsSummary = await getProductMetricsSummary();

  const categoryColors: Record<string, string> = {
    user_impact: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    revenue: 'bg-green-500/10 text-green-400 border-green-500/20',
    efficiency: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    leadership: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    innovation: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Metrics Management</h1>
          <p className="text-gray-400">Track your impact and achievements as a product leader</p>
        </div>
        <Link
          href="/admin/metrics/achievements/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
        </Link>
      </div>

      {/* Metrics Summary */}
      {metricsSummary && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Overall Impact Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Users Impacted</p>
              <p className="text-2xl font-bold text-white">{metricsSummary.total_users_impacted?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Revenue Influenced</p>
              <p className="text-2xl font-bold text-white">${metricsSummary.total_revenue_influenced?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Cost Savings</p>
              <p className="text-2xl font-bold text-white">${metricsSummary.total_cost_savings?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Feature Adoption Rate</p>
              <p className="text-2xl font-bold text-white">{metricsSummary.feature_adoption_rate || 0}%</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Link
              href="/admin/metrics/summary/edit"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Edit Summary
            </Link>
          </div>
        </div>
      )}

      {/* Key Achievements */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Key Achievements
        </h2>
        
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No achievements added yet</p>
            <Link
              href="/admin/metrics/achievements/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              <Plus className="w-4 h-4" />
              Add Your First Achievement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-800 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{achievement.title}</h3>
                      <p className="text-2xl font-bold text-blue-400 mt-1">
                        {achievement.metric_value} {achievement.metric_unit}
                      </p>
                      {achievement.context && (
                        <p className="text-gray-400 text-sm mt-2">{achievement.context}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[achievement.category] || 'bg-gray-700 text-gray-300'}`}>
                          {achievement.category.replace('_', ' ')}
                        </span>
                        {achievement.is_featured && (
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Featured
                          </span>
                        )}
                        {achievement.achievement_date && (
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.achievement_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/admin/metrics/achievements/${achievement.id}/edit`}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => {
                      // TODO: Add delete functionality
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}