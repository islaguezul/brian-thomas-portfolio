# AI Program Leadership Skills + Skills Admin Page

**Date:** 2026-04-01
**Status:** Draft

## Overview

Two related changes:
1. **Data**: Add a new "AI Program Leadership" skill category with 7 AI-industry skills to both tenants
2. **Admin UI**: Build a skills admin page at `/admin/skills` for ongoing management of all skill categories and skills

## Part 1: Data — New Skill Category

### Category

| Field | Value |
|---|---|
| name | AI Program Leadership |
| icon | `🤖` |
| display_order | 2 (bump existing categories 2-6 → 3-7) |
| tenant | both `internal` and `external` |

### Skills (in display order)

| # | skill_name |
|---|---|
| 0 | Specification Precision & Clarity of Intent |
| 1 | Evaluation & Quality Judgment |
| 2 | Multi-Agent Task Decomposition & Delegation |
| 3 | Failure Pattern Recognition |
| 4 | Trust & Security Design |
| 5 | Context Architecture |
| 6 | Cost & Token Economics |

### SQL Operations

1. Bump `display_order` on existing categories with `display_order >= 2` by +1 (for each tenant)
2. Insert new `skill_categories` row with `display_order = 2`
3. Insert 7 `skills` rows linked to the new category

Applied to both `internal` and `external` tenants.

## Part 2: Skills Admin Page

### Route

`/admin/skills` — added to `AdminNav.tsx` navigation items (using `Lightbulb` icon from lucide-react, positioned after Content).

### Page Layout

Single page, no sub-routes. All editing happens inline on this page.

**Structure:**
- `OtherTenantPanel` at top (cross-tenant copy support for skill categories)
- "Add Category" button
- List of category cards, each expandable to show its skills

### Category Card

Each category card displays:
- Icon + name (editable inline on click or via edit button)
- Skill count badge
- Up/down arrows for reordering (swap `display_order` with adjacent category)
- Edit button (toggles inline edit mode for name + icon)
- Delete button (with confirmation, cascades to skills)
- Expand/collapse to show skills list
- `CopyToTenantButton` for cross-tenant copy

### Skills List (within expanded category)

- Ordered list of skill names
- Each skill has: inline-editable name, up/down reorder arrows, delete button
- "Add Skill" button at the bottom of the list

### Interaction Patterns

- **Inline editing**: Click edit icon → field becomes input → save on Enter or blur, cancel on Escape
- **Reorder**: Up/down arrow buttons swap `display_order` with adjacent item. API call on each swap, optimistic UI update.
- **Delete**: `window.confirm()` prompt, then API call. Category delete warns that it will remove all skills in that category.
- **Add**: "Add Category" opens inline form at bottom of list. "Add Skill" opens inline form at bottom of skill list within category.

### API Routes

All routes use `requireAuth()` and `getTenantFromHeaders()`, following existing admin API patterns.

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/skills` | GET | List all categories with skills (calls `getSkillCategories`) |
| `/api/admin/skills` | POST | Create category (calls `createSkillCategory`) |
| `/api/admin/skills/[id]` | PUT | Update category name/icon (calls `updateSkillCategory`) |
| `/api/admin/skills/[id]` | DELETE | Delete category + its skills (calls `deleteSkillCategory`) |
| `/api/admin/skills/[id]/items` | POST | Add skill to category (calls `createSkill`) |
| `/api/admin/skills/[id]/items/[skillId]` | PUT | Update skill name (calls `updateSkill`) |
| `/api/admin/skills/[id]/items/[skillId]` | DELETE | Delete skill (calls `deleteSkill`) |
| `/api/admin/skills/reorder` | PUT | Reorder categories or skills within a category |

### Reorder API

`PUT /api/admin/skills/reorder`

Request body:
```json
{
  "type": "category" | "skill",
  "id": number,
  "direction": "up" | "down",
  "categoryId": number  // only for type: "skill"
}
```

Swaps `display_order` between the target item and its adjacent neighbor.

### DB Function Needed

One new function: `reorderSkillItems(tenant, type, id, direction, categoryId?)` — swaps display_order with the adjacent item. The existing `createSkillCategory`, `updateSkillCategory`, `deleteSkillCategory`, `createSkill`, `updateSkill`, `deleteSkill` functions cover all other operations.

### Cross-Tenant Support

- `OtherTenantPanel` at page top fetches categories from other tenant via `/api/admin/cross-tenant/skills`
- Each category card has a `CopyToTenantButton` (entity type: `skills`)
- Cross-tenant copy already has a `'skills'` case in the copy endpoint — reuse it

### Navigation Update

Add to `AdminNav.tsx` nav items array:
```typescript
{ href: '/admin/skills', label: 'Skills', icon: Lightbulb }
```

Positioned after the Content entry (before Database).

## Out of Scope

- Drag-and-drop reordering (up/down buttons are sufficient)
- Bulk import/export of skills
- Skill descriptions or proficiency levels (the `skills` table only has `skill_name`)
- Changes to the public-facing skills display component (it already renders whatever's in the DB)
