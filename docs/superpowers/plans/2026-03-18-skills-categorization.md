# Skills Categorization Display — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat tech-stack pills in the v2 homepage SkillsSection with categorized skills from the existing admin-managed database.

**Architecture:** Swap the data source in the server component from `getTechStack` to `getSkillCategories`, add snake_case aliases to the `Skill` type for database compatibility, and rewrite `SkillsSection` to render grouped categories with colored pill tags.

**Tech Stack:** Next.js 15 (server components), TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-18-skills-categorization-design.md`

---

### Task 1: Add snake_case aliases to `SkillCategory` and `Skill` interfaces

**Files:**
- Modify: `src/lib/database/types.ts:148-161`

- [ ] **Step 1: Add snake_case field aliases**

In `src/lib/database/types.ts`, update both the `SkillCategory` and `Skill` interfaces to add snake_case aliases matching the database column names. This follows the dual-naming pattern already used by `WorkExperience` and other types.

```typescript
export interface SkillCategory {
  id?: number;
  name: string;
  icon?: string;
  skills?: Skill[];
  displayOrder?: number;
  display_order?: number;
}

export interface Skill {
  id?: number;
  categoryId?: number;
  category_id?: number;
  skillName: string;
  skill_name?: string;
  displayOrder?: number;
  display_order?: number;
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No new type errors (existing code uses camelCase which still works)

- [ ] **Step 3: Commit**

```bash
git add src/lib/database/types.ts
git commit -m "feat: add snake_case aliases to SkillCategory and Skill interfaces"
```

---

### Task 2: Swap data source in homepage server component

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update imports**

In `src/app/page.tsx`, replace the `getTechStack` import with `getSkillCategories`:

```typescript
import { getPersonalInfo, getProjects, getWorkExperience, getSkillCategories } from '@/lib/database/db'
```

- [ ] **Step 2: Update the Promise.all call and SkillsSection prop**

Replace `getTechStack(tenant)` with `getSkillCategories(tenant)` in the destructured Promise.all, and update the prop passed to `SkillsSection`:

```typescript
  const [personalInfo, projects, experiences, skillCategories] = await Promise.all([
    getPersonalInfo(tenant).catch(() => null),
    getProjects(tenant).catch(() => []),
    getWorkExperience(tenant).catch(() => []),
    getSkillCategories(tenant).catch(() => []),
  ])
```

And update the JSX:

```tsx
      skillsSection={<SkillsSection categories={skillCategories} />}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: swap SkillsSection data source from tech stack to skill categories"
```

Note: The build will have a type error at this point because `SkillsSection` still expects the old props. This is resolved in Task 3.

---

### Task 3: Rewrite SkillsSection component for grouped display

**Files:**
- Modify: `src-v2/components/landing/SkillsSection.tsx`

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `src-v2/components/landing/SkillsSection.tsx`:

```tsx
import type { SkillCategory } from '@/lib/database/types'

interface SkillsSectionProps {
  categories: SkillCategory[]
}

const TAG_COLORS = [
  { bg: 'rgba(212, 168, 85, 0.15)', border: 'rgba(212, 168, 85, 0.35)', text: 'var(--accretion)' },
  { bg: 'rgba(107, 143, 181, 0.15)', border: 'rgba(107, 143, 181, 0.35)', text: 'var(--steel-blue)' },
  { bg: 'rgba(160, 124, 176, 0.15)', border: 'rgba(160, 124, 176, 0.35)', text: 'var(--dusty-violet)' },
  { bg: 'rgba(196, 120, 120, 0.15)', border: 'rgba(196, 120, 120, 0.35)', text: 'var(--muted-rose)' },
  { bg: 'rgba(74, 111, 143, 0.15)', border: 'rgba(74, 111, 143, 0.35)', text: 'var(--wheat-light)' },
]

export default function SkillsSection({ categories }: SkillsSectionProps) {
  const nonEmpty = categories.filter(
    (cat) => cat.skills && cat.skills.length > 0
  )

  if (nonEmpty.length === 0) return null

  return (
    <div className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="font-space text-xs tracking-[2px] uppercase mb-8"
          style={{ color: 'var(--accretion)' }}
        >
          Skills
        </div>

        <div className="flex flex-col gap-6">
          {nonEmpty.map((category, catIndex) => {
            const color = TAG_COLORS[catIndex % TAG_COLORS.length]
            return (
              <div key={category.id ?? category.name}>
                <div
                  className="font-space text-xs tracking-[2px] uppercase mb-3"
                  style={{ color: color.text, opacity: 0.6 }}
                >
                  {category.icon && (
                    <span className="mr-2">{category.icon}</span>
                  )}
                  {category.name}
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.skills!.map((skill) => (
                    <span
                      key={skill.id ?? (skill.skillName || skill.skill_name)}
                      className="text-xs px-4 py-2 rounded-full"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        color: color.text,
                      }}
                    >
                      {skill.skillName || skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Open `http://localhost:3000` and scroll to the bottom. Verify:
- Skills section displays with category labels
- Each category has its own color
- Pills are grouped under their category label
- Category icons (emojis) appear next to labels
- If no skill categories exist in the database, the section is hidden

- [ ] **Step 4: Commit**

```bash
git add src-v2/components/landing/SkillsSection.tsx
git commit -m "feat: rewrite SkillsSection to display categorized skills"
```
