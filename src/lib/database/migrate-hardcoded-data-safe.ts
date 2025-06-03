import { sql } from '@vercel/postgres';

export type MigrationMode = 'check' | 'append' | 'replace';

export async function checkExistingData() {
  try {
    const [personal, projects, experience, education, skills, techStack] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM personal_info`,
      sql`SELECT COUNT(*) as count FROM projects`,
      sql`SELECT COUNT(*) as count FROM work_experience`,
      sql`SELECT COUNT(*) as count FROM education`,
      sql`SELECT COUNT(*) as count FROM skill_categories`,
      sql`SELECT COUNT(*) as count FROM tech_stack`
    ]);

    return {
      personal: personal.rows[0].count,
      projects: projects.rows[0].count,
      experience: experience.rows[0].count,
      education: education.rows[0].count,
      skills: skills.rows[0].count,
      techStack: techStack.rows[0].count,
      hasData: Object.values({
        personal: personal.rows[0].count,
        projects: projects.rows[0].count,
        experience: experience.rows[0].count,
        education: education.rows[0].count,
        skills: skills.rows[0].count,
        techStack: techStack.rows[0].count
      }).some(count => count > 0)
    };
  } catch (error) {
    console.error('Error checking existing data:', error);
    return null;
  }
}

export async function clearAllData() {
  console.log('🗑️ Clearing all existing data...');
  
  try {
    // Delete in reverse order of dependencies
    await sql`DELETE FROM project_screenshots`;
    await sql`DELETE FROM project_outcomes`;
    await sql`DELETE FROM project_challenges`;
    await sql`DELETE FROM project_impacts`;
    await sql`DELETE FROM project_features`;
    await sql`DELETE FROM project_technologies`;
    await sql`DELETE FROM projects`;
    
    await sql`DELETE FROM work_responsibilities`;
    await sql`DELETE FROM work_experience`;
    
    await sql`DELETE FROM education_courses`;
    await sql`DELETE FROM education`;
    
    await sql`DELETE FROM skills`;
    await sql`DELETE FROM skill_categories`;
    
    await sql`DELETE FROM tech_stack`;
    await sql`DELETE FROM process_strategy`;
    await sql`DELETE FROM personal_info`;
    await sql`DELETE FROM site_metrics`;
    
    console.log('✅ All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

export async function safeMigrateHardcodedData(mode: MigrationMode = 'check') {
  // First check what's already in the database
  const existingData = await checkExistingData();
  
  if (!existingData) {
    return { 
      success: false, 
      error: 'Could not check existing data',
      mode 
    };
  }

  if (mode === 'check') {
    return {
      success: true,
      mode: 'check',
      existingData,
      message: existingData.hasData 
        ? 'Database already contains data. Choose "replace" to clear and reimport, or "append" to add alongside existing data.'
        : 'Database is empty. Safe to proceed with migration.'
    };
  }

  if (mode === 'replace' && existingData.hasData) {
    console.log('🔄 Replace mode: Clearing existing data first...');
    const cleared = await clearAllData();
    if (!cleared) {
      return {
        success: false,
        error: 'Failed to clear existing data',
        mode
      };
    }
  }

  // Now run the original migration
  const { migrateHardcodedData } = await import('./migrate-hardcoded-data');
  const result = await migrateHardcodedData();
  
  return {
    ...result,
    mode,
    existingData
  };
}