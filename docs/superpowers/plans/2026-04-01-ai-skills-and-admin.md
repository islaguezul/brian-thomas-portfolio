# AI Skills & Skills Admin Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Insert a new "AI Program Leadership" skill category with 7 skills into both tenants, then build a top-level skills admin page at `/admin/skills` with reorder and cross-tenant support.

**Architecture:** Part 1 runs direct SQL via Neon MCP against both tenant databases. Part 2 enhances the existing skills admin page (currently at `/admin/content/skills`) by creating a new top-level page at `/admin/skills` with reorder arrows, expand/collapse categories, and OtherTenantPanel integration. Existing API routes under `/api/admin/content/skills/` are reused; only a new reorder endpoint is added.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, PostgreSQL (Neon), lucide-react icons

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/app/admin/skills/page.tsx` | Top-level skills admin page with reorder + cross-tenant |
| Create | `src/app/api/admin/skills/reorder/route.ts` | Reorder API endpoint |
| Modify | `src/lib/database/db.ts` | Add `reorderSkillItems` function |
| Modify | `src/components/admin/AdminNav.tsx` | Add Skills nav item with Lightbulb icon |

---

### Task 1: SQL Data Insertion — AI Program Leadership Category

Insert the new skill category and skills into both tenants via direct SQL (Neon MCP `run_sql`).

**Neon project IDs:**
- Internal: `dark-breeze-30749226`
- External: `quiet-term-82288399`

- [ ] **Step 1: Bump existing category display_order for internal tenant**

```sql
UPDATE skill_categories SET display_order = display_order + 1 WHERE display_order >= 2 AND tenant = 'internal';
```

Run via `mcp__neon__run_sql` with projectId `dark-breeze-30749226`.

- [ ] **Step 2: Insert new category for internal tenant**

```sql
INSERT INTO skill_categories (name, icon, display_order, tenant)
VALUES ('AI Program Leadership', '🤖', 2, 'internal')
RETURNING id;
```

Run via `mcp__neon__run_sql` with projectId `dark-breeze-30749226`. Note the returned `id`.

- [ ] **Step 3: Insert 7 skills for internal tenant**

Using the category `id` from Step 2 (substitute `{CAT_ID}`):

```sql
INSERT INTO skills (category_id, skill_name, display_order, tenant) VALUES
({CAT_ID}, 'Specification Precision & Clarity of Intent', 0, 'internal'),
({CAT_ID}, 'Evaluation & Quality Judgment', 1, 'internal'),
({CAT_ID}, 'Multi-Agent Task Decomposition & Delegation', 2, 'internal'),
({CAT_ID}, 'Failure Pattern Recognition', 3, 'internal'),
({CAT_ID}, 'Trust & Security Design', 4, 'internal'),
({CAT_ID}, 'Context Architecture', 5, 'internal'),
({CAT_ID}, 'Cost & Token Economics', 6, 'internal');
```

Run via `mcp__neon__run_sql` with projectId `dark-breeze-30749226`.

- [ ] **Step 4: Bump existing category display_order for external tenant**

```sql
UPDATE skill_categories SET display_order = display_order + 1 WHERE display_order >= 2 AND tenant = 'external';
```

Run via `mcp__neon__run_sql` with projectId `quiet-term-82288399`.

- [ ] **Step 5: Insert new category for external tenant**

```sql
INSERT INTO skill_categories (name, icon, display_order, tenant)
VALUES ('AI Program Leadership', '🤖', 2, 'external')
RETURNING id;
```

Run via `mcp__neon__run_sql` with projectId `quiet-term-82288399`. Note the returned `id`.

- [ ] **Step 6: Insert 7 skills for external tenant**

Using the category `id` from Step 5 (substitute `{CAT_ID}`):

```sql
INSERT INTO skills (category_id, skill_name, display_order, tenant) VALUES
({CAT_ID}, 'Specification Precision & Clarity of Intent', 0, 'external'),
({CAT_ID}, 'Evaluation & Quality Judgment', 1, 'external'),
({CAT_ID}, 'Multi-Agent Task Decomposition & Delegation', 2, 'external'),
({CAT_ID}, 'Failure Pattern Recognition', 3, 'external'),
({CAT_ID}, 'Trust & Security Design', 4, 'external'),
({CAT_ID}, 'Context Architecture', 5, 'external'),
({CAT_ID}, 'Cost & Token Economics', 6, 'external');
```

Run via `mcp__neon__run_sql` with projectId `quiet-term-82288399`.

- [ ] **Step 7: Verify both tenants**

Query both databases:
```sql
SELECT sc.name, sc.display_order, s.skill_name, s.display_order as skill_order
FROM skill_categories sc
LEFT JOIN skills s ON s.category_id = sc.id AND s.tenant = sc.tenant
WHERE sc.tenant = '{tenant}'
ORDER BY sc.display_order, s.display_order;
```

Verify "AI Program Leadership" appears at display_order 2 with 7 skills.

---

### Task 2: Add `reorderSkillItems` DB Function

**Files:**
- Modify: `src/lib/database/db.ts` (after the `deleteSkill` function, ~line 1001)

- [ ] **Step 1: Add the reorder function**

Add after `deleteSkill` in `db.ts`:

```typescript
export async function reorderSkillItems(
  tenant: Tenant,
  type: 'category' | 'skill',
  id: number,
  direction: 'up' | 'down',
  categoryId?: number
): Promise<boolean> {
  try {
    const delta = direction === 'up' ? -1 : 1;

    if (type === 'category') {
      // Get current category
      const current = await sql`
        SELECT id, display_order FROM skill_categories
        WHERE id = ${id} AND tenant = ${tenant}
      `;
      if (current.rows.length === 0) return false;
      const currentOrder = current.rows[0].display_order;

      // Find adjacent category
      const adjacent = direction === 'up'
        ? await sql`
            SELECT id, display_order FROM skill_categories
            WHERE tenant = ${tenant} AND display_order < ${currentOrder}
            ORDER BY display_order DESC LIMIT 1
          `
        : await sql`
            SELECT id, display_order FROM skill_categories
            WHERE tenant = ${tenant} AND display_order > ${currentOrder}
            ORDER BY display_order ASC LIMIT 1
          `;
      if (adjacent.rows.length === 0) return false;

      // Swap display_order
      const adjacentOrder = adjacent.rows[0].display_order;
      const adjacentId = adjacent.rows[0].id;
      await sql`UPDATE skill_categories SET display_order = ${adjacentOrder} WHERE id = ${id} AND tenant = ${tenant}`;
      await sql`UPDATE skill_categories SET display_order = ${currentOrder} WHERE id = ${adjacentId} AND tenant = ${tenant}`;
    } else {
      // Get current skill
      const current = await sql`
        SELECT id, display_order FROM skills
        WHERE id = ${id} AND tenant = ${tenant}
      `;
      if (current.rows.length === 0) return false;
      const currentOrder = current.rows[0].display_order;

      // Find adjacent skill within same category
      const adjacent = direction === 'up'
        ? await sql`
            SELECT id, display_order FROM skills
            WHERE tenant = ${tenant} AND category_id = ${categoryId} AND display_order < ${currentOrder}
            ORDER BY display_order DESC LIMIT 1
          `
        : await sql`
            SELECT id, display_order FROM skills
            WHERE tenant = ${tenant} AND category_id = ${categoryId} AND display_order > ${currentOrder}
            ORDER BY display_order ASC LIMIT 1
          `;
      if (adjacent.rows.length === 0) return false;

      // Swap display_order
      const adjacentOrder = adjacent.rows[0].display_order;
      const adjacentId = adjacent.rows[0].id;
      await sql`UPDATE skills SET display_order = ${adjacentOrder} WHERE id = ${id} AND tenant = ${tenant}`;
      await sql`UPDATE skills SET display_order = ${currentOrder} WHERE id = ${adjacentId} AND tenant = ${tenant}`;
    }

    return true;
  } catch (error) {
    console.error('Error reordering skill items:', error);
    return false;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/database/db.ts
git commit -m "feat: add reorderSkillItems database function"
```

---

### Task 3: Add Reorder API Route

**Files:**
- Create: `src/app/api/admin/skills/reorder/route.ts`

- [ ] **Step 1: Create the reorder endpoint**

```typescript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { reorderSkillItems } from '@/lib/database/db';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function PUT(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const { type, id, direction, categoryId } = await request.json();

    const success = await reorderSkillItems(tenant, type, id, direction, categoryId);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to reorder — item may be at boundary' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error reordering skills:', error);
    return NextResponse.json(
      { error: 'Failed to reorder' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/skills/reorder/route.ts
git commit -m "feat: add skills reorder API endpoint"
```

---

### Task 4: Build Skills Admin Page

**Files:**
- Create: `src/app/admin/skills/page.tsx`

The new page enhances the existing `/admin/content/skills/page.tsx` with:
- Expand/collapse category cards
- Up/down reorder arrows for categories and skills
- OtherTenantPanel + CopyToTenantButton cross-tenant support
- Skill count badge on collapsed cards

- [ ] **Step 1: Create the enhanced skills admin page**

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Lightbulb, Plus, Trash2, Edit3, Save, X,
  ChevronDown, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import type { SkillCategory, Skill } from '@/lib/database/types';
import { adminFetch } from '@/lib/admin-fetch';
import OtherTenantPanel from '@/components/admin/OtherTenantPanel';
import CopyToTenantButton from '@/components/admin/CopyToTenantButton';

export default function SkillsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<{ categoryId: number; skillId: number | null }>({ categoryId: 0, skillId: null });
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🔧' });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newSkill, setNewSkill] = useState('');

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
      console.error('Error loading skill categories:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: number) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveCategory(category: SkillCategory) {
    try {
      const response = await adminFetch('/api/admin/content/skills/categories', {
        method: category.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (response.ok) {
        await loadCategories();
        setEditingCategory(null);
        setNewCategory({ name: '', icon: '🔧' });
        setShowAddCategory(false);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Delete this category and ALL its skills?')) return;
    try {
      const response = await adminFetch(`/api/admin/content/skills/categories/${id}`, { method: 'DELETE' });
      if (response.ok) await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  async function reorder(type: 'category' | 'skill', id: number, direction: 'up' | 'down', categoryId?: number) {
    try {
      const response = await adminFetch('/api/admin/skills/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, direction, categoryId }),
      });
      if (response.ok) await loadCategories();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  }

  async function addSkill(categoryId: number, skillName: string) {
    try {
      const response = await adminFetch('/api/admin/content/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, skillName }),
      });
      if (response.ok) {
        await loadCategories();
        setNewSkill('');
        setEditingSkill({ categoryId: 0, skillId: null });
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  }

  async function updateSkill(skillId: number, skillName: string) {
    try {
      const response = await adminFetch(`/api/admin/content/skills/${skillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName }),
      });
      if (response.ok) {
        await loadCategories();
        setEditingSkill({ categoryId: 0, skillId: null });
      }
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  }

  async function deleteSkill(skillId: number) {
    try {
      const response = await adminFetch(`/api/admin/content/skills/${skillId}`, { method: 'DELETE' });
      if (response.ok) await loadCategories();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Skills</h1>
          <p className="text-gray-400">Manage skill categories and individual skills</p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Cross-Tenant Panel */}
      <OtherTenantPanel<SkillCategory>
        entityType="skills"
        renderItem={(cat) => (
          <div className="flex items-center justify-between">
            <span className="text-white">
              {cat.icon} {cat.name}
              <span className="text-gray-500 text-sm ml-2">({cat.skills?.length || 0} skills)</span>
            </span>
            <CopyToTenantButton
              entityType="skills"
              entityId={cat.id!}
              entityName={cat.name}
              onCopied={loadCategories}
            />
          </div>
        )}
      />

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">New Category</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              className="w-16 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-blue-500"
              placeholder="🎯"
            />
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Category name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategory.name.trim()) {
                  saveCategory({ ...newCategory, displayOrder: categories.length });
                }
                if (e.key === 'Escape') {
                  setShowAddCategory(false);
                  setNewCategory({ name: '', icon: '🔧' });
                }
              }}
            />
            <button
              onClick={() => saveCategory({ ...newCategory, displayOrder: categories.length })}
              disabled={!newCategory.name.trim()}
              className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => { setShowAddCategory(false); setNewCategory({ name: '', icon: '🔧' }); }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Category Cards */}
      <div className="space-y-3">
        {categories.map((category, catIndex) => {
          const isExpanded = expandedCategories.has(category.id!);
          const isEditing = editingCategory === category.id;

          return (
            <div key={category.id} className="bg-gray-900 border border-gray-800 rounded-lg">
              {/* Category Header */}
              <div className="flex items-center gap-2 p-4">
                <button
                  onClick={() => toggleExpand(category.id!)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />
                  }
                </button>

                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={category.icon}
                      onChange={(e) => setCategories(prev =>
                        prev.map(c => c.id === category.id ? { ...c, icon: e.target.value } : c)
                      )}
                      className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center"
                    />
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => setCategories(prev =>
                        prev.map(c => c.id === category.id ? { ...c, name: e.target.value } : c)
                      )}
                      className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveCategory(category);
                        if (e.key === 'Escape') setEditingCategory(null);
                      }}
                      autoFocus
                    />
                    <button onClick={() => saveCategory(category)} className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors">
                      <Save className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="p-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpand(category.id!)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-white font-medium">{category.name}</span>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {category.skills?.length || 0}
                      </span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Reorder arrows */}
                      <button
                        onClick={() => reorder('category', category.id!, 'up')}
                        disabled={catIndex === 0}
                        className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => reorder('category', category.id!, 'down')}
                        disabled={catIndex === categories.length - 1}
                        className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(category.id!)}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id!)}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                      <CopyToTenantButton
                        entityType="skills"
                        entityId={category.id!}
                        entityName={category.name}
                        onCopied={loadCategories}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Expanded Skills List */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 space-y-2">
                  {category.skills?.map((skill, skillIndex) => (
                    <div key={skill.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                      {editingSkill.skillId === skill.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={skill.skillName || skill.skill_name || ''}
                            onChange={(e) => setCategories(prev =>
                              prev.map(c => c.id === category.id ? {
                                ...c,
                                skills: c.skills?.map(s => s.id === skill.id ? { ...s, skillName: e.target.value, skill_name: e.target.value } : s)
                              } : c)
                            )}
                            className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && skill.id) updateSkill(skill.id, skill.skillName || skill.skill_name || '');
                              if (e.key === 'Escape') setEditingSkill({ categoryId: 0, skillId: null });
                            }}
                            autoFocus
                          />
                          <button onClick={() => skill.id && updateSkill(skill.id, skill.skillName || skill.skill_name || '')} className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors">
                            <Save className="w-3 h-3 text-white" />
                          </button>
                          <button onClick={() => setEditingSkill({ categoryId: 0, skillId: null })} className="p-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className="text-gray-300 cursor-pointer hover:text-white flex-1"
                            onClick={() => setEditingSkill({ categoryId: category.id!, skillId: skill.id! })}
                          >
                            {skill.skillName || skill.skill_name}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => reorder('skill', skill.id!, 'up', category.id!)}
                              disabled={skillIndex === 0}
                              className="p-0.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3 text-gray-500" />
                            </button>
                            <button
                              onClick={() => reorder('skill', skill.id!, 'down', category.id!)}
                              disabled={skillIndex === (category.skills?.length || 0) - 1}
                              className="p-0.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3 text-gray-500" />
                            </button>
                            <button
                              onClick={() => skill.id && deleteSkill(skill.id)}
                              className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-400" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add Skill */}
                  {editingSkill.categoryId === category.id && editingSkill.skillId === null ? (
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Skill name..."
                        className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSkill.trim() && category.id) addSkill(category.id, newSkill.trim());
                          if (e.key === 'Escape') { setEditingSkill({ categoryId: 0, skillId: null }); setNewSkill(''); }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => category.id && newSkill.trim() && addSkill(category.id, newSkill.trim())}
                        disabled={!newSkill.trim()}
                        className="p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded transition-colors"
                      >
                        <Save className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={() => { setEditingSkill({ categoryId: 0, skillId: null }); setNewSkill(''); }}
                        className="p-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSkill({ categoryId: category.id!, skillId: null })}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-700 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Skill
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && !showAddCategory && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No skill categories yet</p>
          <p className="text-gray-500 text-sm">Click &ldquo;Add Category&rdquo; to get started</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/skills/page.tsx
git commit -m "feat: add top-level skills admin page with reorder and cross-tenant"
```

---

### Task 5: Update AdminNav

**Files:**
- Modify: `src/components/admin/AdminNav.tsx`

- [ ] **Step 1: Add Lightbulb import and Skills nav item**

Add `Lightbulb` to the lucide-react import on line 8.

Insert the Skills nav item after the Content entry in the `navItems` array:

```typescript
{ href: '/admin/skills', label: 'Skills', icon: Lightbulb },
```

The updated array should be:
```typescript
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/personal', label: 'Personal Info', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/case-studies', label: 'Case Studies', icon: BookOpen },
  { href: '/admin/metrics', label: 'Metrics', icon: TrendingUp },
  { href: '/admin/resume', label: 'Resume', icon: FileText },
  { href: '/admin/content', label: 'Content', icon: Sparkles },
  { href: '/admin/skills', label: 'Skills', icon: Lightbulb },
  { href: '/admin/database', label: 'Database', icon: Database },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminNav.tsx
git commit -m "feat: add Skills to admin navigation"
```

---

### Task 6: Verify Build

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Manual verification**

Start dev server (`npm run dev`), navigate to `/admin/skills`:
- Verify categories load with skills
- Verify expand/collapse works
- Verify reorder arrows swap positions
- Verify add/edit/delete category and skill work
- Verify cross-tenant panel shows other tenant's categories
- Verify "Skills" appears in AdminNav with Lightbulb icon

- [ ] **Step 3: Final commit if any fixes needed**
