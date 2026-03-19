# Skills Categorization Display — Design Spec

## Problem

The v2 homepage `SkillsSection` displays a flat jumble of tech stack pills with no organization. The admin system already supports categorized skills (`skill_categories` → `skills` tables, full CRUD API, admin UI), but the public display isn't wired to it.

## Solution

Swap the data source from `TechStackItem[]` to `SkillCategory[]` and update the component to render skills grouped by category.

## Scope

Two files changed. No new files, tables, APIs, or admin UI changes.

## Changes

### 1. `src/app/page.tsx` — Data source swap

- Replace `getTechStack(tenant)` with `getSkillCategories(tenant)` in the `Promise.all` call
- Update the `SkillsSection` prop from `items={techStack}` to `categories={skillCategories}`
- Update imports accordingly
- Remove `getTechStack` import if no longer used elsewhere on this page

### 2. `src-v2/components/landing/SkillsSection.tsx` — Grouped display

**Props change:**
- Accept `{ categories: SkillCategory[] }` instead of `{ items: TechStackItem[] }`

**Rendering:**
- Section header: change "Skills & Tech Stack" to "Skills"
- Each category renders as a group:
  - Label: category icon (emoji) + category name, styled with `font-space text-xs tracking-[2px] uppercase`
  - Pills: each skill in the category as a `rounded-full` pill tag
- Color assignment: each category gets a color from the existing `TAG_COLORS` array by category index (`TAG_COLORS[categoryIndex % TAG_COLORS.length]`). All pills within a category share the same color for visual grouping.
- Categories stack vertically with `gap-6` between groups
- Empty categories (no skills array or empty skills array) are skipped
- If no categories at all, return `null`

**Layout preserved:**
- Same `py-16 px-6` section padding
- Same `max-w-3xl mx-auto` container
- Same pill styling: `text-xs px-4 py-2 rounded-full` with colored background/border/text

## Data shape

Existing `SkillCategory` type from `types.ts`:

```typescript
interface SkillCategory {
  id?: number
  name: string
  icon?: string
  skills?: Skill[]
  displayOrder?: number
}

interface Skill {
  id?: number
  categoryId?: number
  skillName: string
  displayOrder?: number
}
```

## What stays the same

- Database schema (no changes)
- Admin API routes (no changes)
- Admin UI page at `/admin/content/skills/` (no changes)
- Public API at `/api/skills/` (no changes, already returns `SkillCategory[]`)
- `TAG_COLORS` palette (reused as-is)
- `HomePage` component interface (`skillsSection` remains `React.ReactNode`)
