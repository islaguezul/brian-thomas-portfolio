import { Activity, FolderOpen, FileText, Code2, Calendar, Users, TrendingUp, DollarSign, Zap, Award, Target } from 'lucide-react';
// Import tenant-aware database functions
import { getProjects, getWorkExperience, getEducation, getTechStack } from '@/lib/database/db-tenant';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';
import { sql } from '@vercel/postgres';
import Link from 'next/link';

async function getStats() {
  try {
    const tenant = await getAdminSelectedTenant();
    const [projects, experience, education, techStack] = await Promise.all([
      getProjects(tenant),
      getWorkExperience(tenant),
      getEducation(tenant),
      getTechStack(tenant),
    ]);

    return {
      projects: projects.length || 0,
      experience: experience.length || 0,
      education: education.length || 0,
      techStack: techStack.length || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      projects: 0,
      experience: 0,
      education: 0,
      techStack: 0,
    };
  }
}

async function getProductMetrics() {
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
      return {};
    }
    
    // Get aggregated metrics from product_metrics_summary table
    const summaryResult = await sql`
      SELECT * FROM product_metrics_summary 
      WHERE tenant_id = ${tenant}
      LIMIT 1
    `;
    
    if (summaryResult.rows.length > 0) {
      return summaryResult.rows[0];
    }
    
    // Check if project_product_metrics table exists
    const projectMetricsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_product_metrics'
      );
    `;
    
    if (!projectMetricsTableExists.rows[0].exists) {
      return {};
    }
    
    // If no summary exists, calculate from project metrics
    const projectMetricsResult = await sql`
      SELECT 
        COALESCE(SUM(users_impacted), 0) as total_users_impacted,
        COALESCE(SUM(revenue_impact), 0) as total_revenue_influenced,
        COALESCE(SUM(cost_savings), 0) as total_cost_savings,
        COALESCE(AVG(roi_percentage), 0) as average_roi,
        COALESCE(AVG(nps_improvement), 0) as total_nps_improvement,
        COALESCE(SUM(team_size), 0) as total_team_members_led,
        COALESCE(AVG(feature_adoption_rate), 0) as feature_adoption_rate,
        COALESCE(AVG(time_to_market_days), 0) as average_time_to_market
      FROM project_product_metrics
      WHERE tenant_id = ${tenant}
    `;
    
    return projectMetricsResult.rows[0] || {};
  } catch (error) {
    console.error('Error fetching product metrics:', error);
    return {};
  }
}

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
      WHERE tenant_id = ${tenant} AND is_featured = true
      ORDER BY display_order, achievement_date DESC
      LIMIT 3
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching key achievements:', error);
    return [];
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const productMetrics = await getProductMetrics();
  const keyAchievements = await getKeyAchievements();

  // Format numbers for display
  const formatNumber = (num: number | null | undefined) => {
    if (!num || typeof num !== 'number') return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number | null | undefined) => {
    if (!num || typeof num !== 'number') return '$0';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const productMetricCards = [
    { 
      label: 'Users Impacted', 
      value: formatNumber(Number(productMetrics.total_users_impacted) || 0), 
      icon: Users, 
      color: 'text-blue-400',
      subtext: 'Across all products'
    },
    { 
      label: 'Revenue Influenced', 
      value: formatCurrency(Number(productMetrics.total_revenue_influenced) || 0), 
      icon: DollarSign, 
      color: 'text-green-400',
      subtext: 'Direct & indirect impact'
    },
    { 
      label: 'Average ROI', 
      value: `${Number(productMetrics.average_roi || 0).toFixed(0)}%`, 
      icon: TrendingUp, 
      color: 'text-purple-400',
      subtext: 'Across initiatives'
    },
    { 
      label: 'Feature Adoption', 
      value: `${Number(productMetrics.feature_adoption_rate || 0).toFixed(0)}%`, 
      icon: Target, 
      color: 'text-orange-400',
      subtext: 'Average rate'
    },
  ];

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderOpen, color: 'text-blue-400' },
    { label: 'Work Experience', value: stats.experience, icon: FileText, color: 'text-green-400' },
    { label: 'Education', value: stats.education, icon: Calendar, color: 'text-purple-400' },
    { label: 'Tech Stack', value: stats.techStack, icon: Code2, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Product Management Dashboard</h1>
        <p className="text-gray-400">Track your impact as a technical product leader</p>
      </div>

      {/* Product Impact Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Product Impact Metrics
        </h2>
        {Object.keys(productMetrics).length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">Product metrics tables not yet created</p>
            <Link
              href="/admin/database"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Database to Create Tables
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productMetricCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-800/50 border border-gray-700`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
                        <p className="text-gray-500 text-xs mt-1">{stat.subtext}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Key Achievements */}
      {keyAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Key Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keyAchievements.map((achievement) => (
              <div key={achievement.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">{achievement.title}</h3>
                <p className="text-2xl font-bold text-blue-400 mb-1">
                  {achievement.metric_value} {achievement.metric_unit}
                </p>
                {achievement.context && (
                  <p className="text-gray-400 text-sm">{achievement.context}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Stats */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-800/50 border border-gray-700`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a href="/admin/projects/new" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Add New Project</p>
              <p className="text-gray-400 text-sm">Create a new project entry with metrics</p>
            </a>
            <a href="/admin/metrics" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Manage Product Metrics</p>
              <p className="text-gray-400 text-sm">Track achievements and impact</p>
            </a>
            <a href="/admin/personal" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Update Personal Info</p>
              <p className="text-gray-400 text-sm">Edit your bio and contact details</p>
            </a>
            <a href="/admin/resume" className="block p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <p className="text-white font-medium">Edit Resume</p>
              <p className="text-gray-400 text-sm">Update work experience and education</p>
            </a>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Authentication</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">OpenAI API</span>
              <span className="text-green-400 text-sm">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">File Storage</span>
              <span className="text-green-400 text-sm">Local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}