import { 
  Code2, Users, Zap, Plus, Trash2,
  Settings as SettingsIcon
} from 'lucide-react';
import { getTechStack, getSkillCategories, getProcessStrategies } from '@/lib/database/db';
import Link from 'next/link';

export default async function ContentPage() {
  const [techStack, skillCategories, processStrategies] = await Promise.all([
    getTechStack(),
    getSkillCategories(),
    getProcessStrategies(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
        <p className="text-gray-400">Manage tech stack, skills, and process strategies</p>
      </div>

      {/* Tech Stack Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-400" />
            Tech Stack
          </h2>
          <Link
            href="/admin/content/tech-stack/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Technology
          </Link>
        </div>

        {techStack.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No technologies added yet</p>
          </div>
        ) : (
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
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Skill Level</span>
                    <span className="text-white">{tech.level}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${tech.level}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            Professional Skills
          </h2>
          <Link
            href="/admin/content/skills"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            Manage Skills
          </Link>
        </div>

        {skillCategories.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No skill categories added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillCategories.map((category) => (
              <div key={category.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-green-400">{category.icon}</span>
                  {category.name}
                </h3>
                {category.skills && category.skills.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {category.skills.slice(0, 4).map((skill) => (
                      <li key={skill.id} className="text-gray-400">• {skill.skillName}</li>
                    ))}
                    {category.skills.length > 4 && (
                      <li className="text-gray-500 italic">
                        +{category.skills.length - 4} more skills
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No skills added</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process & Strategy Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Process & Strategy
          </h2>
          <Link
            href="/admin/content/process-strategy/new"
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Strategy
          </Link>
        </div>

        {processStrategies.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No strategies added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processStrategies.map((strategy) => (
              <div key={strategy.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <span className="text-yellow-400">{strategy.icon}</span>
                    {strategy.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/content/process-strategy/${strategy.id}/edit`}
                      className="p-1 hover:bg-gray-800 rounded transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-gray-400" />
                    </Link>
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{strategy.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}