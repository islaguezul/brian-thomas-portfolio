import { sql } from '@vercel/postgres';
import type { Tenant } from '@/middleware';

// Map environment variables to what Vercel Postgres expects
if (!process.env.POSTGRES_URL) {
  // Try different possible env var names
  if (process.env.POSTGRES_DATABASE_URL) {
    process.env.POSTGRES_URL = process.env.POSTGRES_DATABASE_URL;
  } else if (process.env.POSTGRES_POSTGRES_URL) {
    process.env.POSTGRES_URL = process.env.POSTGRES_POSTGRES_URL;
  }
}

if (!process.env.POSTGRES_URL_NON_POOLING) {
  // Try different possible env var names
  if (process.env.POSTGRES_DATABASE_URL_UNPOOLED) {
    process.env.POSTGRES_URL_NON_POOLING = process.env.POSTGRES_DATABASE_URL_UNPOOLED;
  } else if (process.env.POSTGRES_POSTGRES_URL_NON_POOLING) {
    process.env.POSTGRES_URL_NON_POOLING = process.env.POSTGRES_POSTGRES_URL_NON_POOLING;
  }
}
import type { 
  PersonalInfo, 
  Project,
  ProjectFeature,
  ProjectImpact,
  ProjectChallenge,
  ProjectOutcome,
  ProjectScreenshot,
  WorkExperience,
  WorkResponsibility,
  Education,
  EducationCourse,
  TechStackItem,
  SkillCategory,
  Skill,
  ProcessStrategy,
} from './types';

export async function initializeDatabase() {
  try {
    const schemaSQL = await fetch('/src/lib/database/schema.sql').then(res => res.text());
    await sql.query(schemaSQL);
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error };
  }
}

// Personal Info
export async function getPersonalInfo(tenant: Tenant): Promise<PersonalInfo | null> {
  try {
    const result = await sql`
      SELECT * FROM personal_info WHERE tenant = ${tenant} LIMIT 1
    `;
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      email: row.email,
      phone: row.phone,
      location: row.location,
      linkedinUrl: row.linkedin_url,
      githubUrl: row.github_url,
      bio: row.bio,
      tagline: row.tagline,
      executiveSummary: row.executive_summary,
      yearsExperience: row.years_experience,
      startYear: row.start_year,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error fetching personal info:', error);
    return null;
  }
}

export async function updatePersonalInfo(tenant: Tenant, data: PersonalInfo): Promise<PersonalInfo | null> {
  try {
    // Check if personal info already exists for this tenant
    const existing = await sql`
      SELECT * FROM personal_info WHERE tenant = ${tenant} LIMIT 1
    `;

    if (existing.rows.length > 0) {
      // Update existing record
      const result = await sql`
        UPDATE personal_info SET
          name = ${data.name},
          title = ${data.title},
          email = ${data.email},
          phone = ${data.phone},
          location = ${data.location},
          linkedin_url = ${data.linkedinUrl},
          github_url = ${data.githubUrl},
          bio = ${data.bio},
          tagline = ${data.tagline},
          executive_summary = ${data.executiveSummary},
          years_experience = ${data.yearsExperience},
          start_year = ${data.startYear},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.rows[0].id} AND tenant = ${tenant}
        RETURNING *
      `;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        title: row.title,
        email: row.email,
        phone: row.phone,
        location: row.location,
        linkedinUrl: row.linkedin_url,
        githubUrl: row.github_url,
        bio: row.bio,
        tagline: row.tagline,
        executiveSummary: row.executive_summary,
        yearsExperience: row.years_experience,
        startYear: row.start_year,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } else {
      // Insert new record
      const result = await sql`
        INSERT INTO personal_info (
          name, title, email, phone, location, linkedin_url, github_url,
          bio, tagline, executive_summary, years_experience, start_year, tenant
        ) VALUES (
          ${data.name}, ${data.title}, ${data.email}, ${data.phone}, 
          ${data.location}, ${data.linkedinUrl}, ${data.githubUrl},
          ${data.bio}, ${data.tagline}, ${data.executiveSummary}, 
          ${data.yearsExperience}, ${data.startYear}, ${tenant}
        )
        RETURNING *
      `;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        title: row.title,
        email: row.email,
        phone: row.phone,
        location: row.location,
        linkedinUrl: row.linkedin_url,
        githubUrl: row.github_url,
        bio: row.bio,
        tagline: row.tagline,
        executiveSummary: row.executive_summary,
        yearsExperience: row.years_experience,
        startYear: row.start_year,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }
  } catch (error) {
    console.error('Error updating personal info:', error);
    return null;
  }
}

// Projects
export async function getProjects(tenant: Tenant): Promise<Project[]> {
  try {
    const projects = await sql<Project>`
      SELECT * FROM projects WHERE tenant = ${tenant} ORDER BY display_order, created_at DESC
    `;
    
    // Fetch related data for each project
    const projectsWithRelations = await Promise.all(
      projects.rows.map(async (project) => {
        const [technologies, features, impacts, challenges, outcomes, screenshots] = await Promise.all([
          sql`SELECT technology FROM project_technologies WHERE project_id = ${project.id} AND tenant = ${tenant}`,
          sql`SELECT * FROM project_features WHERE project_id = ${project.id} AND tenant = ${tenant} ORDER BY display_order`,
          sql`SELECT * FROM project_impacts WHERE project_id = ${project.id} AND tenant = ${tenant}`,
          sql`SELECT * FROM project_challenges WHERE project_id = ${project.id} AND tenant = ${tenant} ORDER BY display_order`,
          sql`SELECT * FROM project_outcomes WHERE project_id = ${project.id} AND tenant = ${tenant} ORDER BY display_order`,
          sql`SELECT * FROM project_screenshots WHERE project_id = ${project.id} AND tenant = ${tenant} ORDER BY display_order`,
        ]);

        return {
          ...project,
          technologies: technologies.rows.map(t => t.technology as string),
          features: features.rows.map((feature) => ({
            id: feature.id,
            projectId: feature.project_id,
            feature: feature.feature,
            displayOrder: feature.display_order
          })) as ProjectFeature[],
          impacts: impacts.rows.map((impact) => ({
            id: impact.id,
            projectId: impact.project_id,
            metricKey: impact.metric_key,
            metricValue: impact.metric_value
          })) as ProjectImpact[],
          challenges: challenges.rows.map((challenge) => ({
            id: challenge.id,
            projectId: challenge.project_id,
            challenge: challenge.challenge,
            displayOrder: challenge.display_order
          })) as ProjectChallenge[],
          outcomes: outcomes.rows.map((outcome) => ({
            id: outcome.id,
            projectId: outcome.project_id,
            outcome: outcome.outcome,
            displayOrder: outcome.display_order
          })) as ProjectOutcome[],
          screenshots: screenshots.rows.map((s) => ({
            id: s.id,
            projectId: s.project_id,
            filePath: s.file_path,
            altText: s.alt_text,
            displayOrder: s.display_order
          })) as ProjectScreenshot[],
        };
      })
    );

    return projectsWithRelations;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProject(tenant: Tenant, id: number): Promise<Project | null> {
  try {
    const project = await sql<Project>`
      SELECT * FROM projects WHERE id = ${id} AND tenant = ${tenant}
    `;
    
    if (!project.rows[0]) return null;

    const [technologies, features, impacts, challenges, outcomes, screenshots] = await Promise.all([
      sql`SELECT technology FROM project_technologies WHERE project_id = ${id} AND tenant = ${tenant}`,
      sql`SELECT * FROM project_features WHERE project_id = ${id} AND tenant = ${tenant} ORDER BY display_order`,
      sql`SELECT * FROM project_impacts WHERE project_id = ${id} AND tenant = ${tenant}`,
      sql`SELECT * FROM project_challenges WHERE project_id = ${id} AND tenant = ${tenant} ORDER BY display_order`,
      sql`SELECT * FROM project_outcomes WHERE project_id = ${id} AND tenant = ${tenant} ORDER BY display_order`,
      sql`SELECT * FROM project_screenshots WHERE project_id = ${id} AND tenant = ${tenant} ORDER BY display_order`,
    ]);

    return {
      ...project.rows[0],
      technologies: technologies.rows.map(t => t.technology as string),
      features: features.rows.map((feature) => ({
        id: feature.id,
        projectId: feature.project_id,
        feature: feature.feature,
        displayOrder: feature.display_order
      })) as ProjectFeature[],
      impacts: impacts.rows.map((impact) => ({
        id: impact.id,
        projectId: impact.project_id,
        metricKey: impact.metric_key,
        metricValue: impact.metric_value
      })) as ProjectImpact[],
      challenges: challenges.rows.map((challenge) => ({
        id: challenge.id,
        projectId: challenge.project_id,
        challenge: challenge.challenge,
        displayOrder: challenge.display_order
      })) as ProjectChallenge[],
      outcomes: outcomes.rows.map((outcome) => ({
        id: outcome.id,
        projectId: outcome.project_id,
        outcome: outcome.outcome,
        displayOrder: outcome.display_order
      })) as ProjectOutcome[],
      screenshots: screenshots.rows.map((s) => ({
        id: s.id,
        projectId: s.project_id,
        filePath: s.file_path,
        altText: s.alt_text,
        displayOrder: s.display_order
      })) as ProjectScreenshot[],
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function createProject(tenant: Tenant, data: Project): Promise<Project | null> {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    const project = await client.query(`
      INSERT INTO projects (
        name, status, description, detailed_description, stage, progress,
        experimental, legacy, live_url, github_url, demo_url, display_order, tenant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      data.name, data.status, data.description, data.detailedDescription,
      data.stage, data.progress, data.experimental, data.legacy,
      data.liveUrl, data.githubUrl, data.demoUrl, data.displayOrder || 0, tenant
    ]);
    
    const projectId = project.rows[0].id;
    
    // Insert related data with tenant
    if (data.technologies?.length) {
      for (const tech of data.technologies) {
        await client.query(
          'INSERT INTO project_technologies (project_id, technology, tenant) VALUES ($1, $2, $3)',
          [projectId, tech, tenant]
        );
      }
    }
    
    if (data.features?.length) {
      for (let i = 0; i < data.features.length; i++) {
        await client.query(
          'INSERT INTO project_features (project_id, feature, display_order, tenant) VALUES ($1, $2, $3, $4)',
          [projectId, data.features[i].feature, i, tenant]
        );
      }
    }
    
    if (data.impacts?.length) {
      for (const impact of data.impacts) {
        if (impact.metricKey && impact.metricValue) {
          await client.query(
            'INSERT INTO project_impacts (project_id, metric_key, metric_value, tenant) VALUES ($1, $2, $3, $4)',
            [projectId, impact.metricKey, impact.metricValue, tenant]
          );
        }
      }
    }
    
    if (data.challenges?.length) {
      for (let i = 0; i < data.challenges.length; i++) {
        if (data.challenges[i].challenge) {
          await client.query(
            'INSERT INTO project_challenges (project_id, challenge, display_order, tenant) VALUES ($1, $2, $3, $4)',
            [projectId, data.challenges[i].challenge, i, tenant]
          );
        }
      }
    }
    
    if (data.outcomes?.length) {
      for (let i = 0; i < data.outcomes.length; i++) {
        if (data.outcomes[i].outcome) {
          await client.query(
            'INSERT INTO project_outcomes (project_id, outcome, display_order, tenant) VALUES ($1, $2, $3, $4)',
            [projectId, data.outcomes[i].outcome, i, tenant]
          );
        }
      }
    }
    
    if (data.screenshots?.length) {
      for (let i = 0; i < data.screenshots.length; i++) {
        if (data.screenshots[i].filePath) {
          await client.query(
            'INSERT INTO project_screenshots (project_id, file_path, alt_text, display_order, tenant) VALUES ($1, $2, $3, $4, $5)',
            [projectId, data.screenshots[i].filePath, data.screenshots[i].altText || null, i, tenant]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    return await getProject(tenant, projectId);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function updateProject(tenant: Tenant, id: number, data: Project): Promise<Project | null> {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(`
      UPDATE projects SET
        name = $1, status = $2, description = $3, detailed_description = $4,
        stage = $5, progress = $6, experimental = $7, legacy = $8,
        live_url = $9, github_url = $10, demo_url = $11, display_order = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 AND tenant = $14
    `, [
      data.name, data.status, data.description, data.detailedDescription,
      data.stage, data.progress, data.experimental, data.legacy,
      data.liveUrl, data.githubUrl, data.demoUrl, data.displayOrder || 0, id, tenant
    ]);
    
    // Update related data
    await client.query('DELETE FROM project_technologies WHERE project_id = $1 AND tenant = $2', [id, tenant]);
    if (data.technologies?.length) {
      for (const tech of data.technologies) {
        await client.query(
          'INSERT INTO project_technologies (project_id, technology, tenant) VALUES ($1, $2, $3)',
          [id, tech, tenant]
        );
      }
    }
    
    await client.query('DELETE FROM project_features WHERE project_id = $1 AND tenant = $2', [id, tenant]);
    if (data.features?.length) {
      for (let i = 0; i < data.features.length; i++) {
        await client.query(
          'INSERT INTO project_features (project_id, feature, display_order, tenant) VALUES ($1, $2, $3, $4)',
          [id, data.features[i].feature, i, tenant]
        );
      }
    }
    
    await client.query('DELETE FROM project_impacts WHERE project_id = $1 AND tenant = $2', [id, tenant]);
    if (data.impacts?.length) {
      for (const impact of data.impacts) {
        if (impact.metricKey && impact.metricValue) {
          await client.query(
            'INSERT INTO project_impacts (project_id, metric_key, metric_value, tenant) VALUES ($1, $2, $3, $4)',
            [id, impact.metricKey, impact.metricValue, tenant]
          );
        }
      }
    }
    
    await client.query('DELETE FROM project_challenges WHERE project_id = $1 AND tenant = $2', [id, tenant]);
    if (data.challenges?.length) {
      for (let i = 0; i < data.challenges.length; i++) {
        if (data.challenges[i].challenge) {
          await client.query(
            'INSERT INTO project_challenges (project_id, challenge, display_order, tenant) VALUES ($1, $2, $3, $4)',
            [id, data.challenges[i].challenge, i, tenant]
          );
        }
      }
    }
    
    await client.query('DELETE FROM project_outcomes WHERE project_id = $1 AND tenant = $2', [id, tenant]);
    if (data.outcomes?.length) {
      for (let i = 0; i < data.outcomes.length; i++) {
        if (data.outcomes[i].outcome) {
          await client.query(
            'INSERT INTO project_outcomes (project_id, outcome, display_order, tenant) VALUES ($1, $2, $3, $4)',
            [id, data.outcomes[i].outcome, i, tenant]
          );
        }
      }
    }
    
    await client.query('DELETE FROM project_screenshots WHERE project_id = $1 AND tenant = $2', [id, tenant]);
    if (data.screenshots?.length) {
      for (let i = 0; i < data.screenshots.length; i++) {
        if (data.screenshots[i].filePath) {
          await client.query(
            'INSERT INTO project_screenshots (project_id, file_path, alt_text, display_order, tenant) VALUES ($1, $2, $3, $4, $5)',
            [id, data.screenshots[i].filePath, data.screenshots[i].altText || null, i, tenant]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    return await getProject(tenant, id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating project:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function deleteProject(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM projects WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Work Experience
export async function getWorkExperience(tenant: Tenant): Promise<WorkExperience[]> {
  try {
    const experiences = await sql<WorkExperience>`
      SELECT * FROM work_experience WHERE tenant = ${tenant} ORDER BY display_order, start_date DESC
    `;
    
    const experiencesWithResponsibilities = await Promise.all(
      experiences.rows.map(async (exp) => {
        const responsibilities = await sql`
          SELECT * FROM work_responsibilities 
          WHERE experience_id = ${exp.id} AND tenant = ${tenant}
          ORDER BY display_order
        `;
        return {
          ...exp,
          responsibilities: responsibilities.rows as WorkResponsibility[],
        };
      })
    );

    return experiencesWithResponsibilities;
  } catch (error) {
    console.error('Error fetching work experience:', error);
    return [];
  }
}

export async function createWorkExperience(tenant: Tenant, data: WorkExperience): Promise<WorkExperience | null> {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    const experience = await client.query(`
      INSERT INTO work_experience (
        title, company, start_date, end_date, is_current, display_order, tenant
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      data.title, data.company, data.startDate, data.endDate,
      data.isCurrent, data.displayOrder || 0, tenant
    ]);
    
    const expId = experience.rows[0].id;
    
    // Insert responsibilities
    if (data.responsibilities?.length) {
      for (let i = 0; i < data.responsibilities.length; i++) {
        await client.query(
          'INSERT INTO work_responsibilities (experience_id, responsibility, display_order, tenant) VALUES ($1, $2, $3, $4)',
          [expId, data.responsibilities[i].responsibility, i, tenant]
        );
      }
    }
    
    await client.query('COMMIT');
    return experience.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating work experience:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function updateWorkExperience(tenant: Tenant, id: number, data: WorkExperience): Promise<WorkExperience | null> {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(`
      UPDATE work_experience SET
        title = $1, company = $2, start_date = $3, end_date = $4,
        is_current = $5, display_order = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND tenant = $8
    `, [
      data.title, data.company, data.startDate, data.endDate,
      data.isCurrent, data.displayOrder || 0, id, tenant
    ]);
    
    // Update responsibilities
    await client.query('DELETE FROM work_responsibilities WHERE experience_id = $1 AND tenant = $2', [id, tenant]);
    if (data.responsibilities?.length) {
      for (let i = 0; i < data.responsibilities.length; i++) {
        await client.query(
          'INSERT INTO work_responsibilities (experience_id, responsibility, display_order, tenant) VALUES ($1, $2, $3, $4)',
          [id, data.responsibilities[i].responsibility, i, tenant]
        );
      }
    }
    
    await client.query('COMMIT');
    
    const updated = await sql<WorkExperience>`SELECT * FROM work_experience WHERE id = ${id} AND tenant = ${tenant}`;
    return updated.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating work experience:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function deleteWorkExperience(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM work_experience WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting work experience:', error);
    return false;
  }
}

// Education
export async function getEducation(tenant: Tenant): Promise<Education[]> {
  try {
    const education = await sql<Education>`
      SELECT * FROM education WHERE tenant = ${tenant} ORDER BY display_order, graduation_year DESC
    `;
    
    const educationWithCourses = await Promise.all(
      education.rows.map(async (edu) => {
        const courses = await sql`
          SELECT * FROM education_courses 
          WHERE education_id = ${edu.id} AND tenant = ${tenant}
          ORDER BY display_order
        `;
        return {
          ...edu,
          courses: courses.rows as EducationCourse[],
        };
      })
    );

    return educationWithCourses;
  } catch (error) {
    console.error('Error fetching education:', error);
    return [];
  }
}

export async function createEducation(tenant: Tenant, data: Education): Promise<Education | null> {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    const education = await client.query(`
      INSERT INTO education (
        degree, school, graduation_year, concentration, display_order, tenant
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.degree, data.school, data.graduationYear,
      data.concentration, data.displayOrder || 0, tenant
    ]);
    
    const eduId = education.rows[0].id;
    
    // Insert courses
    if (data.courses?.length) {
      for (let i = 0; i < data.courses.length; i++) {
        await client.query(
          'INSERT INTO education_courses (education_id, course_name, display_order, tenant) VALUES ($1, $2, $3, $4)',
          [eduId, data.courses[i].courseName, i, tenant]
        );
      }
    }
    
    await client.query('COMMIT');
    return education.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating education:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function updateEducation(tenant: Tenant, id: number, data: Education): Promise<Education | null> {
  const client = await sql.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(`
      UPDATE education SET
        degree = $1, school = $2, graduation_year = $3,
        concentration = $4, display_order = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND tenant = $7
    `, [
      data.degree, data.school, data.graduationYear,
      data.concentration, data.displayOrder || 0, id, tenant
    ]);
    
    // Update courses
    await client.query('DELETE FROM education_courses WHERE education_id = $1 AND tenant = $2', [id, tenant]);
    if (data.courses?.length) {
      for (let i = 0; i < data.courses.length; i++) {
        await client.query(
          'INSERT INTO education_courses (education_id, course_name, display_order, tenant) VALUES ($1, $2, $3, $4)',
          [id, data.courses[i].courseName, i, tenant]
        );
      }
    }
    
    await client.query('COMMIT');
    
    const updated = await sql<Education>`SELECT * FROM education WHERE id = ${id} AND tenant = ${tenant}`;
    return updated.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating education:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function deleteEducation(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM education WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting education:', error);
    return false;
  }
}

// Tech Stack
export async function getTechStack(tenant: Tenant): Promise<TechStackItem[]> {
  try {
    const result = await sql<TechStackItem>`
      SELECT * FROM tech_stack 
      WHERE show_in_portfolio = true AND tenant = ${tenant}
      ORDER BY display_order, name
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return [];
  }
}

export async function updateAllTechStackLevels(tenant: Tenant, defaultLevel: number = 0.5): Promise<number> {
  try {
    const result = await sql`
      UPDATE tech_stack 
      SET level = ${defaultLevel}, updated_at = CURRENT_TIMESTAMP
      WHERE tenant = ${tenant} AND (level IS NULL OR level > 10 OR level = 0 OR level = 1)
    `;
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error updating tech stack levels:', error);
    return 0;
  }
}

export async function createTechStack(tenant: Tenant, data: TechStackItem): Promise<TechStackItem | null> {
  try {
    const result = await sql<TechStackItem>`
      INSERT INTO tech_stack (
        name, icon, level, category, display_order, show_in_portfolio, tenant
      ) VALUES (
        ${data.name}, ${data.icon}, ${data.level}, ${data.category},
        ${data.displayOrder || 0}, ${data.showInPortfolio ?? true}, ${tenant}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating tech stack:', error);
    return null;
  }
}

export async function updateTechStack(tenant: Tenant, id: number, data: TechStackItem): Promise<TechStackItem | null> {
  try {
    const result = await sql<TechStackItem>`
      UPDATE tech_stack SET
        name = ${data.name},
        icon = ${data.icon},
        level = ${data.level},
        category = ${data.category},
        display_order = ${data.displayOrder || 0},
        show_in_portfolio = ${data.showInPortfolio ?? true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND tenant = ${tenant}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating tech stack:', error);
    return null;
  }
}

export async function deleteTechStack(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM tech_stack WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting tech stack:', error);
    return false;
  }
}

// Skills
export async function getSkillCategories(tenant: Tenant): Promise<SkillCategory[]> {
  try {
    const categories = await sql<SkillCategory>`
      SELECT * FROM skill_categories WHERE tenant = ${tenant} ORDER BY display_order
    `;
    
    const categoriesWithSkills = await Promise.all(
      categories.rows.map(async (cat) => {
        const skills = await sql`
          SELECT * FROM skills 
          WHERE category_id = ${cat.id} AND tenant = ${tenant}
          ORDER BY display_order
        `;
        return {
          ...cat,
          skills: skills.rows as Skill[],
        };
      })
    );

    return categoriesWithSkills;
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    return [];
  }
}

export async function createSkillCategory(tenant: Tenant, data: SkillCategory): Promise<SkillCategory | null> {
  try {
    const result = await sql<SkillCategory>`
      INSERT INTO skill_categories (
        name, icon, display_order, tenant
      ) VALUES (
        ${data.name}, ${data.icon}, ${data.displayOrder || 0}, ${tenant}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating skill category:', error);
    return null;
  }
}

export async function updateSkillCategory(tenant: Tenant, id: number, data: SkillCategory): Promise<SkillCategory | null> {
  try {
    const result = await sql<SkillCategory>`
      UPDATE skill_categories SET
        name = ${data.name},
        icon = ${data.icon},
        display_order = ${data.displayOrder || 0}
      WHERE id = ${id} AND tenant = ${tenant}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating skill category:', error);
    return null;
  }
}

export async function deleteSkillCategory(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM skill_categories WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting skill category:', error);
    return false;
  }
}

export async function createSkill(tenant: Tenant, categoryId: number, skillName: string): Promise<Skill | null> {
  try {
    const result = await sql<Skill>`
      INSERT INTO skills (
        category_id, skill_name, display_order, tenant
      ) VALUES (
        ${categoryId}, ${skillName}, 0, ${tenant}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating skill:', error);
    return null;
  }
}

export async function updateSkill(tenant: Tenant, id: number, skillName: string): Promise<Skill | null> {
  try {
    const result = await sql<Skill>`
      UPDATE skills SET
        skill_name = ${skillName}
      WHERE id = ${id} AND tenant = ${tenant}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating skill:', error);
    return null;
  }
}

export async function deleteSkill(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM skills WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting skill:', error);
    return false;
  }
}

// Process & Strategy
export async function getProcessStrategies(tenant: Tenant): Promise<ProcessStrategy[]> {
  try {
    const result = await sql<ProcessStrategy>`
      SELECT * FROM process_strategy WHERE tenant = ${tenant} ORDER BY display_order
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching process strategies:', error);
    return [];
  }
}

export async function createProcessStrategy(tenant: Tenant, data: ProcessStrategy): Promise<ProcessStrategy | null> {
  try {
    const result = await sql<ProcessStrategy>`
      INSERT INTO process_strategy (
        title, description, icon, display_order, tenant
      ) VALUES (
        ${data.title}, ${data.description}, ${data.icon},
        ${data.displayOrder || 0}, ${tenant}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating process strategy:', error);
    return null;
  }
}

export async function updateProcessStrategy(tenant: Tenant, id: number, data: ProcessStrategy): Promise<ProcessStrategy | null> {
  try {
    const result = await sql<ProcessStrategy>`
      UPDATE process_strategy SET
        title = ${data.title},
        description = ${data.description},
        icon = ${data.icon},
        display_order = ${data.displayOrder || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND tenant = ${tenant}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating process strategy:', error);
    return null;
  }
}

export async function deleteProcessStrategy(tenant: Tenant, id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM process_strategy WHERE id = ${id} AND tenant = ${tenant}`;
    return true;
  } catch (error) {
    console.error('Error deleting process strategy:', error);
    return false;
  }
}

// Database Migrations
export async function runMigration001(): Promise<boolean> {
  try {
    console.log('Running migration 001: Increase screenshot file_path size...');
    
    // Check if migration has already been run by checking column type
    const columnInfo = await sql`
      SELECT data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'project_screenshots' 
      AND column_name = 'file_path'
    `;
    
    if (columnInfo.rows[0]?.data_type === 'text') {
      console.log('Migration 001 already applied.');
      return true;
    }
    
    // Run the migration
    await sql`ALTER TABLE project_screenshots ALTER COLUMN file_path TYPE TEXT`;
    await sql`COMMENT ON COLUMN project_screenshots.file_path IS 'Stores file paths or base64 data URLs (temporary until file storage service is implemented)'`;
    
    console.log('Migration 001 completed successfully.');
    return true;
  } catch (error) {
    console.error('Error running migration 001:', error);
    return false;
  }
}

export async function runMigration002(): Promise<boolean> {
  try {
    console.log('Running migration 002: Change tech_stack level to decimal...');
    
    // Check if migration has already been run by checking column type
    const columnInfo = await sql`
      SELECT data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'tech_stack' 
      AND column_name = 'level'
    `;
    
    if (columnInfo.rows[0]?.data_type === 'numeric') {
      console.log('Migration 002 already applied.');
      return true;
    }
    
    // Run the migration
    await sql`ALTER TABLE tech_stack ALTER COLUMN level TYPE DECIMAL(5,2)`;
    await sql`ALTER TABLE tech_stack ADD CONSTRAINT tech_stack_level_check CHECK (level >= 0 AND level <= 100)`;
    
    console.log('Migration 002 completed successfully.');
    return true;
  } catch (error) {
    console.error('Error running migration 002:', error);
    return false;
  }
}

// Copy content between tenants
export async function copyProjectToTenant(projectId: number, fromTenant: Tenant, toTenant: Tenant): Promise<Project | null> {
  const project = await getProject(fromTenant, projectId);
  if (!project) return null;
  
  // Remove the id to create a new project
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...projectData } = project;
  return await createProject(toTenant, projectData as Project);
}

export async function copyWorkExperienceToTenant(expId: number, fromTenant: Tenant, toTenant: Tenant): Promise<WorkExperience | null> {
  const experiences = await getWorkExperience(fromTenant);
  const experience = experiences.find(exp => exp.id === expId);
  if (!experience) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...expData } = experience;
  return await createWorkExperience(toTenant, expData as WorkExperience);
}

export async function copyEducationToTenant(eduId: number, fromTenant: Tenant, toTenant: Tenant): Promise<Education | null> {
  const educationList = await getEducation(fromTenant);
  const education = educationList.find(edu => edu.id === eduId);
  if (!education) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...eduData } = education;
  return await createEducation(toTenant, eduData as Education);
}

export async function copyTechStackToTenant(techId: number, fromTenant: Tenant, toTenant: Tenant): Promise<TechStackItem | null> {
  const techStack = await getTechStack(fromTenant);
  const tech = techStack.find(t => t.id === techId);
  if (!tech) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...techData } = tech;
  return await createTechStack(toTenant, techData as TechStackItem);
}

export async function copySkillCategoryToTenant(catId: number, fromTenant: Tenant, toTenant: Tenant): Promise<SkillCategory | null> {
  const categories = await getSkillCategories(fromTenant);
  const category = categories.find(cat => cat.id === catId);
  if (!category) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, skills, ...catData } = category;
  const newCategory = await createSkillCategory(toTenant, catData as SkillCategory);
  
  if (newCategory && newCategory.id && skills) {
    for (const skill of skills) {
      await createSkill(toTenant, newCategory.id, skill.skillName);
    }
  }
  
  return newCategory;
}

export async function copyProcessStrategyToTenant(strategyId: number, fromTenant: Tenant, toTenant: Tenant): Promise<ProcessStrategy | null> {
  const strategies = await getProcessStrategies(fromTenant);
  const strategy = strategies.find(s => s.id === strategyId);
  if (!strategy) return null;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...strategyData } = strategy;
  return await createProcessStrategy(toTenant, strategyData as ProcessStrategy);
}