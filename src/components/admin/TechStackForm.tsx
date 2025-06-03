'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import type { TechStackItem } from '@/lib/database/types';
import { techCategories, getTechEmoji } from '@/lib/icons';

interface TechStackFormProps {
  tech?: TechStackItem;
  isNew?: boolean;
}

export default function TechStackForm({ tech, isNew = false }: TechStackFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TechStackItem>({
    name: tech?.name || '',
    icon: tech?.icon || '',
    level: tech?.level || 50,
    category: tech?.category || '',
    displayOrder: tech?.displayOrder || 0,
    showInPortfolio: tech?.showInPortfolio ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew 
        ? '/api/admin/content/tech-stack' 
        : `/api/admin/content/tech-stack/${tech?.id}`;
      
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/content');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving tech stack:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateEmoji = () => {
    const emoji = getTechEmoji(formData.name);
    setFormData({ ...formData, icon: emoji });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Technology Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technology Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={updateEmoji}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., React, Python, Docker"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon/Emoji
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-center text-2xl"
                  placeholder="🔧"
                  maxLength={2}
                />
                <button
                  type="button"
                  onClick={updateEmoji}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select category</option>
                {techCategories.map((cat) => (
                  <option key={cat.value} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skill Level ({formData.level}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.level || 50}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showInPortfolio || false}
              onChange={(e) => setFormData({ ...formData, showInPortfolio: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Show in portfolio</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/content')}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : (isNew ? 'Add Technology' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
}