import type { Tenant } from '@/middleware';

/**
 * Content update, September 2026: Director, AI & Automation.
 *
 * Applies the same changes to the live data that were made to the seed and
 * migration files — new title, refreshed tagline and executive summary,
 * 15 years of experience, the Frontier Door & Cabinet role as the current
 * position, and Blue Origin closed out — without retyping them in the admin UI.
 *
 * Run from /admin/database, which POSTs to
 * /api/admin/database/content-update-2026-09. Idempotent: personal info fields
 * are simply set, Blue Origin is only closed while it is still marked current,
 * and the Frontier role is only inserted when it is missing.
 */

export const CONTENT_UPDATE_ID = '2026-09-director-ai-automation';

export const CONTENT_UPDATE_TENANTS: Tenant[] = ['internal', 'external'];

export const PERSONAL_INFO_UPDATE = {
  title: 'Director, AI & Automation',
  tagline: 'Turning Vision into Reality Through AI & Automation',
  executiveSummary:
    "I thrive at the intersection of technology, process, and people—translating ambiguity into clarity and vision into reality. At Frontier Door & Cabinet—a full-vertical manufacturer, distributor, and installer of commercial, government, and multi-family cabinetry, doors, and countertops—I lead AI and automation, a function that didn't exist before this role. I'm building it from zero: the strategy, the platform, the standards, and the first generation of software that runs on them. As a member of the executive team, I own the whole practice: from the company's AI strategy and the platform underneath it, to the standards for how software is built and promoted, to the governance that keeps company data inside approved systems and the delivery of the applications and integrations the business depends on. Whether I'm deciding what we build, buy, or skip, untangling an ERP with no documented API, or working alongside IT rather than around it so the mandate is earned, not asserted, I bring curiosity, rigor, and a bias for action. I'm passionate about building systems that compound—each tool leaves behind more foundation than it consumed, the practice that produced it gets faster with every release, and work gets better for everyone involved.",
  yearsExperience: 15,
};

export const PREVIOUS_ROLE = {
  company: 'Blue Origin',
  endDate: '2026-04-30',
};

export const NEW_ROLE = {
  title: 'Director, AI & Automation',
  company: 'Frontier Door & Cabinet',
  startDate: '2026-05-01',
  responsibilities: [
    'Rolled out Claude Enterprise company-wide, enablement first, then stood up an internal chat platform and a multi-vendor model gateway behind company-owned identity, logging, and cost controls, with a model and vendor strategy that ensures the company is never locked in.',
    'Shipped a defect tracking app for operations, a warehouse forecasting dashboard, a door configurator that produces bills of materials, and a work-tracking board in Microsoft 365, all on Power Platform and Azure; now rehosting an AI estimating takeoff tool.',
    'Created a version-controlled data layer in Dataverse with Fabric and OneLake, managed as code; mapped an ERP with no documented API and automated workflows across SharePoint, OneDrive, and meeting capture, with a full Digital Thread as the north star.',
    "Launched a citizen developer program where the people closest to the work build with AI; now building the agent-driven pipeline that promotes their tools into architected software, with a governed source of truth for each tool's data so the foundation grows from real demand. Two checks stay human: what a tool does, and that its rebuild matches.",
    'Stood up an Azure landing zone with containerized services, Key Vault for every secret, least-privilege Entra ID identities with a tested kill switch, and a team password manager, with static analysis and secret scanning on every push; now hardening the supply chain.',
    "Published an AI & Automation Hub on SharePoint, a public work board showing every initiative's status, a company knowledge base, and a design system for everyone who builds at the company, so the executive team sees what is built, why, and where it stands.",
    'Established an AI-native engineering practice: agentic development with written decision records for every architectural choice, independent multi-model review before anything irreversible ships, skills and templates that encode how software is built, and AI standards adopted with IT. The practice is the product.',
  ],
};

/**
 * Minimal query interface so the update can run inside a transaction on a
 * pooled client in production and against a plain `pg` client in tests.
 */
export type QueryExecutor = (
  text: string,
  values?: unknown[]
) => Promise<{ rows: Record<string, unknown>[]; rowCount?: number | null }>;

export interface TenantContentUpdateResult {
  tenant: Tenant;
  personalInfoUpdated: boolean;
  previousRoleClosed: boolean;
  newRoleInserted: boolean;
  newRoleExperienceId: number | null;
}

export interface TenantContentUpdateStatus {
  tenant: Tenant;
  hasPersonalInfo: boolean;
  titleApplied: boolean;
  newRolePresent: boolean;
  applied: boolean;
}

export async function applyContentUpdateForTenant(
  query: QueryExecutor,
  tenant: Tenant
): Promise<TenantContentUpdateResult> {
  const personal = await query(
    `UPDATE personal_info
     SET title = $1, tagline = $2, executive_summary = $3, years_experience = $4
     WHERE tenant = $5`,
    [
      PERSONAL_INFO_UPDATE.title,
      PERSONAL_INFO_UPDATE.tagline,
      PERSONAL_INFO_UPDATE.executiveSummary,
      PERSONAL_INFO_UPDATE.yearsExperience,
      tenant,
    ]
  );

  // Only touch Blue Origin while it is still the current role, so a re-run
  // never overwrites an end date edited later in the admin UI.
  const previous = await query(
    `UPDATE work_experience
     SET is_current = false, end_date = $1
     WHERE tenant = $2 AND company = $3 AND is_current = true`,
    [PREVIOUS_ROLE.endDate, tenant, PREVIOUS_ROLE.company]
  );

  const existing = await query(
    `SELECT id FROM work_experience
     WHERE tenant = $1 AND company = $2 AND title = $3
     LIMIT 1`,
    [tenant, NEW_ROLE.company, NEW_ROLE.title]
  );

  const result: TenantContentUpdateResult = {
    tenant,
    personalInfoUpdated: (personal.rowCount ?? 0) > 0,
    previousRoleClosed: (previous.rowCount ?? 0) > 0,
    newRoleInserted: false,
    newRoleExperienceId: existing.rows[0] ? Number(existing.rows[0].id) : null,
  };

  if (result.newRoleExperienceId !== null) {
    return result;
  }

  // Make room at the top of the timeline, then insert the new role ahead of
  // whatever the smallest remaining display_order is.
  await query(
    `UPDATE work_experience SET display_order = display_order + 1 WHERE tenant = $1`,
    [tenant]
  );
  const lowest = await query(
    `SELECT COALESCE(MIN(display_order), 1) AS lowest FROM work_experience WHERE tenant = $1`,
    [tenant]
  );
  const displayOrder = Number(lowest.rows[0]?.lowest ?? 1) - 1;

  const inserted = await query(
    `INSERT INTO work_experience (
       title, company, start_date, end_date, is_current, display_order, tenant
     ) VALUES ($1, $2, $3, NULL, true, $4, $5)
     RETURNING id`,
    [NEW_ROLE.title, NEW_ROLE.company, NEW_ROLE.startDate, displayOrder, tenant]
  );
  const experienceId = Number(inserted.rows[0].id);

  for (let i = 0; i < NEW_ROLE.responsibilities.length; i++) {
    await query(
      `INSERT INTO work_responsibilities (experience_id, responsibility, display_order, tenant)
       VALUES ($1, $2, $3, $4)`,
      [experienceId, NEW_ROLE.responsibilities[i], i, tenant]
    );
  }

  result.newRoleInserted = true;
  result.newRoleExperienceId = experienceId;
  return result;
}

export async function applyContentUpdate(
  query: QueryExecutor,
  tenants: Tenant[] = CONTENT_UPDATE_TENANTS
): Promise<TenantContentUpdateResult[]> {
  const results: TenantContentUpdateResult[] = [];
  for (const tenant of tenants) {
    results.push(await applyContentUpdateForTenant(query, tenant));
  }
  return results;
}

export async function getContentUpdateStatus(
  query: QueryExecutor,
  tenants: Tenant[] = CONTENT_UPDATE_TENANTS
): Promise<TenantContentUpdateStatus[]> {
  const statuses: TenantContentUpdateStatus[] = [];
  for (const tenant of tenants) {
    const personal = await query(
      `SELECT title FROM personal_info WHERE tenant = $1 LIMIT 1`,
      [tenant]
    );
    const role = await query(
      `SELECT id FROM work_experience
       WHERE tenant = $1 AND company = $2 AND title = $3
       LIMIT 1`,
      [tenant, NEW_ROLE.company, NEW_ROLE.title]
    );
    const hasPersonalInfo = personal.rows.length > 0;
    const titleApplied = hasPersonalInfo && personal.rows[0].title === PERSONAL_INFO_UPDATE.title;
    const newRolePresent = role.rows.length > 0;
    statuses.push({
      tenant,
      hasPersonalInfo,
      titleApplied,
      newRolePresent,
      applied: titleApplied && newRolePresent,
    });
  }
  return statuses;
}
