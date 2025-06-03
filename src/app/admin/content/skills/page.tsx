'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import type { SkillCategory } from '@/lib/database/types';

export default function SkillsPage() {
  const [loading, setLoading] = useState(true);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<{categoryId: number, skillId: number | null}>({ categoryId: 0, skillId: null });
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🔧' });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadSkillCategories();
  }, []);

  async function loadSkillCategories() {
    try {
      const response = await fetch('/api/admin/content/skills');
      if (response.ok) {
        const categories = await response.json();
        setSkillCategories(categories);
      }
    } catch (error) {
      console.error('Error loading skill categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory(category: SkillCategory) {
    try {
      const response = await fetch('/api/admin/content/skills/categories', {
        method: category.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (response.ok) {
        await loadSkillCategories();
        setEditingCategory(null);
        setNewCategory({ name: '', icon: '🔧' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category and all its skills?')) return;
    
    try {
      const response = await fetch(`/api/admin/content/skills/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadSkillCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  async function addSkill(categoryId: number, skillName: string) {
    try {
      const response = await fetch('/api/admin/content/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, skillName }),
      });
      if (response.ok) {
        await loadSkillCategories();
        setNewSkill('');
        setEditingSkill({ categoryId: 0, skillId: null });
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  }

  async function updateSkill(skillId: number, skillName: string) {
    try {
      const response = await fetch(`/api/admin/content/skills/${skillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName }),
      });
      if (response.ok) {
        await loadSkillCategories();
        setEditingSkill({ categoryId: 0, skillId: null });
      }
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  }

  async function deleteSkill(skillId: number) {
    try {
      const response = await fetch(`/api/admin/content/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadSkillCategories();
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Manage Professional Skills</h1>
        <p className="text-gray-400 mb-4">
          Organize your skills into categories for your portfolio and resume. 
          Create categories like &quot;Product Strategy&quot; or &quot;Technical Leadership&quot;, then add specific skills within each.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-2">
            <strong>How it works:</strong> Categories appear as section headers (e.g., &quot;Product Management&quot;), 
            and individual skills are listed underneath (e.g., &quot;Roadmap Planning&quot;, &quot;Stakeholder Management&quot;).
          </p>
          <p className="text-blue-300 text-sm">
            <strong>Where it appears:</strong> Skills display in the &quot;Professional Skills&quot; section of your Resume page and PDF exports.
          </p>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            <strong>Current Status:</strong> Skills are currently hardcoded in the Resume component. 
            You&apos;ll need to connect this system to replace the static skills data.
          </p>
        </div>
      </div>

      {/* Add New Category */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-400" />
          Add Skill Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category Name <span className="text-gray-500">(appears as section header)</span>
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Product Strategy, Technical Leadership"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon <span className="text-gray-500">(emoji for visual appeal)</span>
            </label>
            <input
              type="text"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="🎯 📊 💼 🔧"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => saveCategory({ ...newCategory, displayOrder: skillCategories.length })}
              disabled={!newCategory.name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Skill Categories */}
      <div className="space-y-6">
        {skillCategories.map((category) => (
          <div key={category.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              {editingCategory === category.id ? (
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="text"
                    value={category.icon}
                    onChange={(e) => setSkillCategories(prev => 
                      prev.map(cat => cat.id === category.id ? { ...cat, icon: e.target.value } : cat)
                    )}
                    className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center"
                    placeholder="🎯"
                  />
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => setSkillCategories(prev => 
                      prev.map(cat => cat.id === category.id ? { ...cat, name: e.target.value } : cat)
                    )}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Category name"
                  />
                  <button
                    onClick={() => saveCategory(category)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Category • {category.skills?.length || 0} skills
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => category.id && setEditingCategory(category.id)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => category.id && deleteCategory(category.id)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Skills List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Individual Skills:</h4>
              {category.skills?.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                  {editingSkill.skillId === skill.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={skill.skillName}
                        onChange={(e) => setSkillCategories(prev => 
                          prev.map(cat => cat.id === category.id ? {
                            ...cat,
                            skills: cat.skills?.map(s => s.id === skill.id ? { ...s, skillName: e.target.value } : s)
                          } : cat)
                        )}
                        className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && skill.id) {
                            updateSkill(skill.id, skill.skillName);
                          }
                          if (e.key === 'Escape') {
                            setEditingSkill({ categoryId: 0, skillId: null });
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => skill.id && updateSkill(skill.id, skill.skillName)}
                        className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                      >
                        <Save className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setEditingSkill({ categoryId: 0, skillId: null })}
                        className="p-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className="text-gray-300 cursor-pointer hover:text-white flex-1"
                        onClick={() => category.id && skill.id && setEditingSkill({ categoryId: category.id, skillId: skill.id })}
                      >
                        {skill.skillName}
                      </span>
                      <button
                        onClick={() => skill.id && deleteSkill(skill.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Add New Skill */}
              {editingSkill.categoryId === category.id ? (
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill name..."
                    className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSkill.trim() && category.id) {
                        addSkill(category.id, newSkill.trim());
                      }
                      if (e.key === 'Escape') {
                        setEditingSkill({ categoryId: 0, skillId: null });
                        setNewSkill('');
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => category.id && addSkill(category.id, newSkill.trim())}
                    disabled={!newSkill.trim()}
                    className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded transition-colors"
                  >
                    <Save className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingSkill({ categoryId: 0, skillId: null });
                      setNewSkill('');
                    }}
                    className="p-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => category.id && setEditingSkill({ categoryId: category.id, skillId: null })}
                  className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded-lg p-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {skillCategories.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No skill categories yet</p>
          <p className="text-gray-500 text-sm">Create your first category above to get started</p>
        </div>
      )}
    </div>
  );
}