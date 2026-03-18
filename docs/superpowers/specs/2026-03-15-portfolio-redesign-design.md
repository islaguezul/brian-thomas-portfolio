# Portfolio Redesign — Scroll-Stop Black Hole Landing Page

## Context

The existing brian-thomas-portfolio site (brianthomastpm.com / briantpm.com) needs a frontend redesign. The current design uses a standard resume homepage with a particle background, tech ticker, and impact timeline. The new design centers on an immersive scroll-driven black hole video experience that captures attention and establishes a "deep space" visual identity.

The backend (PostgreSQL, admin panel, API routes, multi-tenant system, NextAuth) is stable and stays untouched. Only the public-facing frontend is being rebuilt.

## Architecture

### Approach: src-v2/ with Shared Routing

New frontend code lives in `src-v2/`. The existing `src/app/` page routes become thin wrappers that import from `src-v2/`. Admin, API, and middleware remain in `src/`.

```
src-v2/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Glass navbar, always visible, contact in header
│   │   └── Footer.tsx              # Minimal footer
│   ├── landing/
│   │   ├── FrameLoader.tsx          # Full-screen loader with progress bar
│   │   ├── ScrollVideo.tsx         # Canvas + frame controller (scroll-driven)
│   │   ├── HeroOverlay.tsx         # Name/title overlay on video
│   │   ├── GlassCard.tsx           # Reusable liquid glass card component
│   │   ├── AboutCard.tsx           # Bio content in glass card
│   │   ├── HighlightsCard.tsx      # Key metrics/highlights in glass card
│   │   ├── ExperienceSection.tsx   # Work experience timeline (post-video)
│   │   └── SkillsSection.tsx       # Tech stack display (post-video)
│   └── projects/
│       ├── ProjectGrid.tsx         # Card grid layout
│       ├── ProjectCard.tsx         # Individual project card
│       └── ProjectModal.tsx        # Project detail modal overlay
├── pages/
│   ├── HomePage.tsx                # Orchestrates full landing page
│   └── ProjectsPage.tsx            # Projects gallery page
├── hooks/
│   └── useScrollVideo.ts           # Scroll position → frame index mapping
├── lib/
│   └── frame-loader.ts             # Preload extracted video frames
└── styles/
    └── globals.css                 # Deep space theme, glass effects, animations
```

### What Changes in src/

- `src/app/page.tsx` → imports `HomePage` from `src-v2/pages/`
- `src/app/projects/page.tsx` → imports `ProjectsPage` from `src-v2/pages/`
- `src/app/layout.tsx` → updated with new fonts (Space Grotesk + Inter), new global CSS
- `src/app/globals.css` → replaced with `src-v2/styles/globals.css`

### What Stays Untouched

- `src/app/admin/` — entire admin panel
- `src/app/api/` — all API routes
- `src/app/auth/` — authentication pages
- `src/middleware.ts` — tenant detection, auth middleware
- `src/lib/database/` — database layer, types, migrations
- `src/lib/auth.ts`, `src/lib/auth-options.ts` — auth utilities
- `src/lib/tenant.ts`, `src/lib/tenant-context.tsx` — tenant utilities
- `src/hooks/useRealtimeUpdates.ts` — real-time update hooks

## Design System

### Color Palette — Warm Cosmic

Derived from the black hole accretion disc video (warm golds, ambers, creams against deep black):

#### Warm Foundation (from black hole accretion disc)

| Token           | Hex       | Usage                              |
|-----------------|-----------|--------------------------------------|
| Void Black      | `#02040a` | Page background, deepest darks       |
| Warm Black      | `#0d0a06` | Card backgrounds, glass base         |
| Deep Amber      | `#1a1008` | Secondary backgrounds, sections      |
| Dark Gold       | `#8b6914` | Tertiary accent, muted highlights    |
| Accretion Gold  | `#d4a855` | Primary accent — labels, headings    |
| Wheat Light     | `#f5deb3` | Secondary text, softer emphasis      |
| Floral White    | `#fffaf0` | Primary text, headings               |

#### Cool Complements (for hierarchy, differentiation, and contrast)

| Token           | Hex       | Usage                              |
|-----------------|-----------|--------------------------------------|
| Steel Blue      | `#6b8fb5` | Primary CTA, interactive elements, links, "production" stage |
| Deep Steel      | `#4a6f8f` | Secondary blue accent, tag rotation  |
| Dusty Violet    | `#a07cb0` | Categorical distinction, tag rotation |
| Muted Rose      | `#c47878` | Status/emphasis accent, tag rotation |

### Typography

- **Headings**: Space Grotesk (bold, clean geometric sans)
- **Body**: Inter (keep existing, excellent readability)
- **Accents**: Uppercase + letter-spacing for labels/section headers

### Glass Card Treatment — Liquid Glass Enhanced

CSS-only liquid glass approximation (no WebGL):

```css
.glass-card {
  background: rgba(13, 10, 6, 0.42);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}
```

Enhancements layered via pseudo-elements and inner divs:
- **Animated gradient border**: Rotating gold → teal → cream using CSS `@property` animation
- **Specular top highlight**: 1px gradient line across top edge simulating light reflection
- **Inner radial glow**: Subtle warm highlight in upper-left for depth
- **Saturate boost**: `saturate(1.2)` makes video colors pop through the glass

Fallback: Static gradient border in browsers without `@property` support (Firefox).

## Landing Page — Scroll Flow

### Phase 1: Hero + Video Begins

- **Video canvas**: `position: fixed`, fills viewport, renders extracted frames synced to scroll
- **Hero overlay**: Name, title, "Scroll to explore" prompt centered over the video
- **Navbar**: Always visible, transparent glass treatment, contains logo/name + nav links + Contact CTA
- Scroll begins video playback via frame mapping

### Phase 2: Glass Cards Scroll Over Video

- Glass cards scroll up naturally as the user scrolls (normal document flow)
- Cards use Liquid Glass treatment — video pixels visible and shifting through the glass in real-time
- Video stays `position: fixed` behind the cards

**Cards (flexible — can add/remove without reworking scroll mechanics):**
1. **About Card**: Bio/tagline from `personal_info` table (tenant-scoped)
2. **Highlights Card**: Key metrics — years experience, products shipped, specialization. Data derived from existing fields: `personal_info.years_of_experience` for years, project count from `/api/projects`, and specialization text from `personal_info` bio/title. No new database columns needed.

The video scroll height is tunable independently of card count, so pacing can be adjusted later.

### Phase 3: Video Scrolls Away → Content Takes Over

- When scroll position passes the video's final frame, the video container transitions from `position: fixed` to `position: relative`
- The video naturally scrolls up and out of view
- A new opaque content container appears below:

**Post-Video Sections:**
1. **Work Experience Timeline**: Vertical timeline from `work_experience` table
2. **Skills & Tech Stack**: Visual display from `tech_stack` table
3. **Minimal Footer**: Copyright, minimal links

## Other Pages

### Projects Page (`/projects`)

- URL: `/projects` (matches existing route in `src/app/projects/page.tsx`)
- Card grid layout with redesigned cards in the deep space theme
- Click card → modal overlay with full project details
- Data from existing `/api/projects` endpoint (tenant-scoped)
- Reuses existing `useRealtimeUpdates` hook for live updates

### Resume Page — Out of Scope

Not included in this redesign. The navbar "Resume" link is removed; the landing page's Experience and Skills sections serve this purpose. A dedicated resume page can be added in a follow-up if needed.

## Navbar

- **Always visible** from first load
- Transparent glass treatment matching cards (Liquid Glass Enhanced)
- Fades from transparent to slightly more opaque after the video section ends
- **Contents**: Logo/name (left) · Home, Projects links (right) · Contact CTA button (right, teal accent)
- Contact info accessible via the header CTA at all times

## Technical Implementation

### Scroll-Driven Video: Canvas + Extracted Frames

1. **Frame extraction**: Use FFmpeg to extract ~100 WebP frames from `blackhole_disc.mp4` (16MB source). Target ~30-50KB per frame (~3-5MB total). Frames stored in `public/frames/` as `frame_0001.webp` through `frame_NNNN.webp`
2. **Preloading**: `frame-loader.ts` preloads all frames with a full-screen loader showing progress percentage. On load failure (network error, timeout), display a retry button. After 3 failed retries, fall back to showing the first successfully loaded frame as a static background
3. **Canvas rendering**: `ScrollVideo.tsx` renders frames to a `<canvas>` element based on scroll position
4. **Retina support**: Canvas scaled by `devicePixelRatio` for sharp rendering
5. **Cover-fit**: Canvas drawing uses cover-fit on desktop, zoomed contain-fit on mobile
6. **Scroll mapping**: `useScrollVideo.ts` maps scroll percentage (within the video section) to frame index
7. **Performance**: Passive scroll listeners, `requestAnimationFrame` for rendering, no `scroll-behavior: smooth`

### Frame Extraction Command

```bash
ffmpeg -i blackhole_disc.mp4 -vf "fps=15" -q:v 2 -f image2 frames/frame_%04d.webp
```

Adjust `fps` to control frame count. ~100 frames is a good starting point.

### Fixed → Relative Video Transition

```
Scroll Position:
0 ──────────────── video_end ──────────── page_end
│  Video fixed,     │  Video becomes    │
│  frames play      │  relative,        │
│  Glass cards      │  scrolls away     │
│  scroll over it   │  Content below    │
```

Implementation uses `position: sticky`:
- A wrapper div with `height: [video_scroll_height]vh` creates the scroll space
- The canvas is `position: sticky; top: 0` inside this wrapper — it stays fixed while the wrapper scrolls
- When the wrapper's bottom edge reaches the viewport bottom, the sticky canvas naturally releases and scrolls away with the wrapper
- Content container sits in normal flow below the wrapper
- This is purely CSS — no JS position switching needed, and avoids z-index/paint-layer issues with toggling `position: fixed`

### Mobile Responsiveness

- Video scroll height: 350vh desktop → 250vh mobile (less scrolling needed)
- Glass cards: Full width on mobile with smaller padding
- Navbar: Hamburger menu on mobile
- Frame count can be reduced on mobile for bandwidth savings (detect via `navigator.connection` or viewport width)

## Multi-Tenant

Existing tenant system untouched. Each domain can have fully independent content:
- `briantpm.com` → "internal" tenant
- `brianthomastpm.com` → "external" tenant
- Different bio, highlights, projects, experience per tenant
- Managed from single admin panel at `briantpm.com/admin`

## Git Workflow

- **Branch**: `redesign/v2` off `main`
- Build `src-v2/` on the feature branch
- Existing `src/components/` stays alongside until merge
- At merge time: archive or delete old `src/components/`, the page routes now point to `src-v2/`

## Data Dependencies

All content comes from existing API endpoints (no new tables needed):

| Component          | API Endpoint              | DB Table(s)                    |
|--------------------|---------------------------|--------------------------------|
| About Card         | `/api/personal`           | `personal_info`                |
| Highlights Card    | `/api/personal`, `/api/projects` | `personal_info`, `projects`  |
| Experience Section | `/api/resume/experience`  | `work_experience`, `work_responsibilities` |
| Skills Section     | `/api/tech-stack`         | `tech_stack`                   |
| Projects Grid      | `/api/projects`           | `projects` + related tables    |

## Verification Plan

1. **Local development**: `npm run dev` — verify scroll video plays, glass cards render, all data loads
2. **Frame extraction**: Verify FFmpeg outputs correct frame count and quality
3. **Responsive**: Test on mobile viewport (Chrome DevTools) — glass cards, navbar hamburger, video scaling
4. **Multi-tenant**: Test with `?tenant=external` query param — verify different content loads
5. **Performance**: Lighthouse audit — check for canvas/backdrop-filter performance on mobile
6. **Cross-browser**: Test backdrop-filter + @property animation in Chrome, Safari, Firefox (verify fallbacks)
7. **Admin unchanged**: Verify `/admin` routes still work, no regressions
8. **Build**: `npm run build` passes with no errors
9. **Print styles**: Verify print output still works (if maintained)
