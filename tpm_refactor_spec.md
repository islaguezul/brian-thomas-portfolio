# TPM Portfolio Refactor Specification

## 1. Objective
Refactor the current Next.js application to a "Resume-First" architecture. 
The current Homepage (`/`) will become the "Experience & Impact" resume view. 
The current Project Gallery will move to a dedicated `/case-studies` route.

## 2. Architecture Changes
- **Current:** `app/page.tsx` (Portfolio)
- **New Structure:**
  - `app/page.tsx`: The new "Resume/Timeline" view.
  - `app/case-studies/page.tsx`: The moved Portfolio/Gallery view.
  - `app/components/ImpactTimeline.tsx`: New component for the resume timeline.
  - `app/components/TechTicker.tsx`: New component for the skills marquee.

## 3. Design Constraints
- **Strictly maintain** existing design tokens (fonts, colors, spacing) from `globals.css` and `tailwind.config.ts`.
- Do not introduce new UI libraries (e.g., no Shadcn/UI unless already installed). Use native Tailwind.
- **Print View:** The Home page must support a "Print to PDF" view. Use CSS `@media print` to hide navigation, footers, and decorative elements, ensuring the timeline prints as a clean, black-and-white document.

## 4. Content Strategy (Copy & Layout)

### A. The Home Page (The Resume)
**Hero Section:**
- Headline: "I bridge the gap between complex engineering and product delivery. Shipping at scale since [Year]."
- Subhead: "Technical Program Manager"
- Metrics Row (3-col grid): "$2M+ Budget Managed", "15+ Teams Aligned", "0 Critical Delays"

**The Tech Ticker:**
- A smooth scrolling marquee below the metrics.
- Items: JIRA, AWS, Kubernetes, SQL, React, Python, Agile, CI/CD.

**The Timeline (Vertical Layout):**
- **Format:** Left side (Company/Date), Right side (Impact/STAR Method).
- **Entry 1 Example:**
  - Role: Senior TPM @ [Company]
  - Impact: "Led migration of legacy monolith to microservices, reducing deployment time by 40%."
  - Action: Button "View Migration Case Study" -> Links to `/case-studies`

### B. The Case Studies Page (Old Home Page)
- **Title:** "Ship Log" or "Case Studies"
- **Grid:** Reuse existing project cards, but prioritize architectural diagrams over UI screenshots if available.

## 5. Execution Steps
1. Create the new page routes (`app/case-studies`).
2. Move existing portfolio logic from `app/page.tsx` to `app/case-studies/page.tsx`.
3. Create `ImpactTimeline` and `TechTicker` components.
4. Build the new `app/page.tsx` using the content above.
5. Add `@media print` styles to `globals.css` to hide the Nav and Footer.

## 6. Data Architecture (CRITICAL)
- **Dynamic Data Source:** This application is backed by a database and Admin Portal. The resume and project data are NOT static.
- **Requirement:** When building `ImpactTimeline` and `ResumeHomepage`:
  - Do **not** create mock data arrays.
  - Inspect the current `src/components/Portfolio.tsx` (or `page.tsx`) to identify the existing data fetching logic (e.g., `useResume`, `api/resume`, or database hooks).
  - **Reuse** this exact data fetching pattern for the new components.