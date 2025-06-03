import { Activity, FolderOpen, FileText, Code2, Calendar, TrendingUp } from 'lucide-react';
// Import our database functions that handle the environment variable mapping
import { getProjects, getWorkExperience, getEducation, getTechStack } from '@/lib/database/db';

async function getStats() {
  try {
    const [projects, experience, education, techStack] = await Promise.all([
      getProjects(),
      getWorkExperience(),
      getEducation(),
      getTechStack(),
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

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderOpen, color: 'text-blue-400' },
    { label: 'Work Experience', value: stats.experience, icon: FileText, color: 'text-green-400' },
    { label: 'Education', value: stats.education, icon: Calendar, color: 'text-purple-400' },
    { label: 'Tech Stack', value: stats.techStack, icon: Code2, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage your portfolio content and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
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
              <p className="text-gray-400 text-sm">Create a new project entry</p>
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