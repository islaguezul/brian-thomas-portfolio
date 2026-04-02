'use client';

import { useState, useEffect } from 'react';
import {
  Lightbulb,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { SkillCategory, Skill } from '@/lib/database/types';
import { adminFetch } from '@/lib/admin-fetch';
import OtherTenantPanel from '@/components/admin/OtherTenantPanel';
import CopyToTenantButton from '@/components/admin/CopyToTenantButton';

export default function SkillsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Add category form
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🔧');

  // Editing category
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryIcon, setEditCategoryIcon] = useState('');

  // Editing skill
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editSkillName, setEditSkillName] = useState('');

  // Add skill
  const [addingSkillCategoryId, setAddingSkillCategoryId] = useState<number | null>(null);
  const [newSkillName, setNewSkillName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await adminFetch('/api/admin/content/skills');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpanded(categoryId: number) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  // ── Category CRUD ──────────────────────────────────────────────────────────

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const response = await adminFetch('/api/admin/content/skills/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          displayOrder: categories.length,
        }),
      });
      if (response.ok) {
        await loadCategories();
        setNewCategoryName('');
        setNewCategoryIcon('🔧');
        setShowAddCategory(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  function startEditCategory(category: SkillCategory) {
    if (!category.id) return;
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryIcon(category.icon || '');
  }

  async function handleSaveCategory(category: SkillCategory) {
    if (!category.id) return;
    try {
      const response = await adminFetch('/api/admin/content/skills/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          name: editCategoryName.trim() || category.name,
          icon: editCategoryIcon,
          displayOrder: category.displayOrder ?? category.display_order,
        }),
      });
      if (response.ok) {
        await loadCategories();
        setEditingCategoryId(null);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!window.confirm('Delete this category and all its skills?')) return;
    try {
      const response = await adminFetch(`/api/admin/content/skills/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  async function handleReorderCategory(id: number, direction: 'up' | 'down') {
    try {
      await adminFetch('/api/admin/skills/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', id, direction }),
      });
      await loadCategories();
    } catch (error) {
      console.error('Error reordering category:', error);
    }
  }

  // ── Skill CRUD ─────────────────────────────────────────────────────────────

  async function handleAddSkill(categoryId: number) {
    if (!newSkillName.trim()) return;
    try {
      const response = await adminFetch('/api/admin/content/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, skillName: newSkillName.trim() }),
      });
      if (response.ok) {
        await loadCategories();
        setNewSkillName('');
        setAddingSkillCategoryId(null);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  }

  function startEditSkill(skill: Skill) {
    if (!skill.id) return;
    setEditingSkillId(skill.id);
    setEditSkillName(skill.skillName || skill.skill_name || '');
  }

  async function handleSaveSkill(skillId: number) {
    if (!editSkillName.trim()) return;
    try {
      const response = await adminFetch(`/api/admin/content/skills/${skillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: editSkillName.trim() }),
      });
      if (response.ok) {
        await loadCategories();
        setEditingSkillId(null);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  }

  async function handleDeleteSkill(skillId: number) {
    try {
      const response = await adminFetch(`/api/admin/content/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadCategories();
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  }

  async function handleReorderSkill(id: number, direction: 'up' | 'down', categoryId: number) {
    try {
      await adminFetch('/api/admin/skills/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'skill', id, direction, categoryId }),
      });
      await loadCategories();
    } catch (error) {
      console.error('Error reordering skill:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-7 h-7 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Skills</h1>
        </div>
        <button
          onClick={() => setShowAddCategory((v) => !v)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Cross-tenant panel */}
      <OtherTenantPanel<SkillCategory>
        entityType="skills"
        renderItem={(item, onCopy) => (
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300">
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.name}
              <span className="ml-2 text-gray-500 text-sm">
                ({item.skills?.length ?? 0} skills)
              </span>
            </span>
            {item.id && (
              <CopyToTenantButton
                entityType="skills"
                entityId={item.id}
                entityName={item.name}
                onCopied={onCopy}
              />
            )}
          </div>
        )}
      />

      {/* Add Category form */}
      {showAddCategory && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white mb-4">New Category</h2>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Icon</label>
              <input
                type="text"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                className="w-16 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-blue-500"
                placeholder="🔧"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Product Strategy"
                autoFocus
              />
            </div>
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName('');
                setNewCategoryIcon('🔧');
              }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Category cards */}
      {categories.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-10 text-center">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No skill categories yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category, catIdx) => {
            const isExpanded = category.id ? expandedCategories.has(category.id) : false;
            const isEditingCat = editingCategoryId === category.id;
            const skillCount = category.skills?.length ?? 0;

            return (
              <div
                key={category.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
              >
                {/* Category header row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Expand toggle */}
                  <button
                    onClick={() => category.id && toggleExpanded(category.id)}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {isEditingCat ? (
                    /* Inline edit mode */
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={editCategoryIcon}
                        onChange={(e) => setEditCategoryIcon(e.target.value)}
                        className="w-14 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-blue-500"
                        placeholder="🔧"
                      />
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCategory(category);
                          if (e.key === 'Escape') setEditingCategoryId(null);
                        }}
                        className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveCategory(category)}
                        className="p-1.5 bg-green-600 hover:bg-green-700 rounded transition-colors"
                      >
                        <Save className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    /* Normal display mode */
                    <>
                      <button
                        onClick={() => category.id && toggleExpanded(category.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        {category.icon && (
                          <span className="text-xl">{category.icon}</span>
                        )}
                        <span className="font-semibold text-white">{category.name}</span>
                        <span className="ml-2 bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                          {skillCount}
                        </span>
                      </button>

                      {/* Reorder + actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => category.id && handleReorderCategory(category.id, 'up')}
                          disabled={catIdx === 0}
                          className="p-1.5 hover:bg-gray-800 disabled:opacity-30 rounded transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => category.id && handleReorderCategory(category.id, 'down')}
                          disabled={catIdx === categories.length - 1}
                          className="p-1.5 hover:bg-gray-800 disabled:opacity-30 rounded transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => startEditCategory(category)}
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => category.id && handleDeleteCategory(category.id)}
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        </button>
                        {category.id && (
                          <CopyToTenantButton
                            entityType="skills"
                            entityId={category.id}
                            entityName={category.name}
                            onCopied={loadCategories}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Expanded skills list */}
                {isExpanded && (
                  <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-2">
                    {category.skills?.map((skill, skillIdx) => {
                      const isEditingSkill = editingSkillId === skill.id;
                      const displayName = skill.skillName || skill.skill_name || '';

                      return (
                        <div
                          key={skill.id}
                          className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
                        >
                          {isEditingSkill ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editSkillName}
                                onChange={(e) => setEditSkillName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && skill.id) handleSaveSkill(skill.id);
                                  if (e.key === 'Escape') setEditingSkillId(null);
                                }}
                                className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => skill.id && handleSaveSkill(skill.id)}
                                className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                              >
                                <Save className="w-3.5 h-3.5 text-white" />
                              </button>
                              <button
                                onClick={() => setEditingSkillId(null)}
                                className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                              >
                                <X className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span
                                className="flex-1 text-gray-300 hover:text-white cursor-pointer text-sm"
                                onClick={() => startEditSkill(skill)}
                              >
                                {displayName}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    skill.id &&
                                    category.id &&
                                    handleReorderSkill(skill.id, 'up', category.id)
                                  }
                                  disabled={skillIdx === 0}
                                  className="p-1 hover:bg-gray-700 disabled:opacity-30 rounded transition-colors"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                <button
                                  onClick={() =>
                                    skill.id &&
                                    category.id &&
                                    handleReorderSkill(skill.id, 'down', category.id)
                                  }
                                  disabled={skillIdx === (category.skills?.length ?? 0) - 1}
                                  className="p-1 hover:bg-gray-700 disabled:opacity-30 rounded transition-colors"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                <button
                                  onClick={() => skill.id && handleDeleteSkill(skill.id)}
                                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Add skill row */}
                    {addingSkillCategoryId === category.id ? (
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <input
                          type="text"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && category.id) handleAddSkill(category.id);
                            if (e.key === 'Escape') {
                              setAddingSkillCategoryId(null);
                              setNewSkillName('');
                            }
                          }}
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                          placeholder="Skill name..."
                          autoFocus
                        />
                        <button
                          onClick={() => category.id && handleAddSkill(category.id)}
                          disabled={!newSkillName.trim()}
                          className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded transition-colors"
                        >
                          <Save className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => {
                            setAddingSkillCategoryId(null);
                            setNewSkillName('');
                          }}
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingSkillCategoryId(category.id ?? null);
                          setNewSkillName('');
                        }}
                        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-700 hover:border-gray-500 rounded-lg py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Skill
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
