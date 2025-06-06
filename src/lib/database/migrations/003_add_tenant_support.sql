-- Migration 003: Add tenant support to all tables
-- This migration adds a 'tenant' column to all content tables and duplicates existing data

-- Add tenant column to all content tables with default 'internal'
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE project_technologies ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE project_features ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE project_impacts ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE project_challenges ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE project_outcomes ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE project_screenshots ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE work_experience ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE work_responsibilities ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE education ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE education_courses ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE skill_categories ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE process_strategy ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';
ALTER TABLE site_metrics ADD COLUMN IF NOT EXISTS tenant VARCHAR(20) DEFAULT 'internal';

-- Admin users should not have tenant column as they manage both tenants
-- portfolio_updates is a system table and doesn't need tenant

-- Add check constraints to ensure only valid tenant values
ALTER TABLE personal_info ADD CONSTRAINT personal_info_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE projects ADD CONSTRAINT projects_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE project_technologies ADD CONSTRAINT project_technologies_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE project_features ADD CONSTRAINT project_features_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE project_impacts ADD CONSTRAINT project_impacts_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE project_challenges ADD CONSTRAINT project_challenges_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE project_outcomes ADD CONSTRAINT project_outcomes_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE project_screenshots ADD CONSTRAINT project_screenshots_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE work_experience ADD CONSTRAINT work_experience_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE work_responsibilities ADD CONSTRAINT work_responsibilities_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE education ADD CONSTRAINT education_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE education_courses ADD CONSTRAINT education_courses_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE tech_stack ADD CONSTRAINT tech_stack_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE skill_categories ADD CONSTRAINT skill_categories_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE skills ADD CONSTRAINT skills_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE process_strategy ADD CONSTRAINT process_strategy_tenant_check CHECK (tenant IN ('internal', 'external'));
ALTER TABLE site_metrics ADD CONSTRAINT site_metrics_tenant_check CHECK (tenant IN ('internal', 'external'));

-- Create indexes for better performance when filtering by tenant
CREATE INDEX idx_personal_info_tenant ON personal_info(tenant);
CREATE INDEX idx_projects_tenant ON projects(tenant);
CREATE INDEX idx_project_technologies_tenant ON project_technologies(tenant);
CREATE INDEX idx_project_features_tenant ON project_features(tenant);
CREATE INDEX idx_project_impacts_tenant ON project_impacts(tenant);
CREATE INDEX idx_project_challenges_tenant ON project_challenges(tenant);
CREATE INDEX idx_project_outcomes_tenant ON project_outcomes(tenant);
CREATE INDEX idx_project_screenshots_tenant ON project_screenshots(tenant);
CREATE INDEX idx_work_experience_tenant ON work_experience(tenant);
CREATE INDEX idx_work_responsibilities_tenant ON work_responsibilities(tenant);
CREATE INDEX idx_education_tenant ON education(tenant);
CREATE INDEX idx_education_courses_tenant ON education_courses(tenant);
CREATE INDEX idx_tech_stack_tenant ON tech_stack(tenant);
CREATE INDEX idx_skill_categories_tenant ON skill_categories(tenant);
CREATE INDEX idx_skills_tenant ON skills(tenant);
CREATE INDEX idx_process_strategy_tenant ON process_strategy(tenant);
CREATE INDEX idx_site_metrics_tenant ON site_metrics(tenant);

-- Now duplicate all existing data for the 'external' tenant
-- This ensures both tenants start with the same content

-- Duplicate personal_info
INSERT INTO personal_info (name, title, email, phone, location, linkedin_url, github_url, bio, tagline, executive_summary, years_experience, start_year, tenant, created_at, updated_at)
SELECT name, title, email, phone, location, linkedin_url, github_url, bio, tagline, executive_summary, years_experience, start_year, 'external', created_at, updated_at
FROM personal_info WHERE tenant = 'internal';

-- Duplicate projects and related tables
DO $$
DECLARE
    internal_project RECORD;
    external_project_id INTEGER;
BEGIN
    FOR internal_project IN SELECT * FROM projects WHERE tenant = 'internal' LOOP
        -- Insert the project for external tenant
        INSERT INTO projects (name, status, description, detailed_description, stage, progress, experimental, legacy, live_url, github_url, demo_url, display_order, tenant, created_at, updated_at)
        VALUES (internal_project.name, internal_project.status, internal_project.description, internal_project.detailed_description, 
                internal_project.stage, internal_project.progress, internal_project.experimental, internal_project.legacy, 
                internal_project.live_url, internal_project.github_url, internal_project.demo_url, internal_project.display_order, 
                'external', internal_project.created_at, internal_project.updated_at)
        RETURNING id INTO external_project_id;
        
        -- Duplicate project_technologies
        INSERT INTO project_technologies (project_id, technology, tenant)
        SELECT external_project_id, technology, 'external'
        FROM project_technologies WHERE project_id = internal_project.id AND tenant = 'internal';
        
        -- Duplicate project_features
        INSERT INTO project_features (project_id, feature, display_order, tenant)
        SELECT external_project_id, feature, display_order, 'external'
        FROM project_features WHERE project_id = internal_project.id AND tenant = 'internal';
        
        -- Duplicate project_impacts
        INSERT INTO project_impacts (project_id, metric_key, metric_value, tenant)
        SELECT external_project_id, metric_key, metric_value, 'external'
        FROM project_impacts WHERE project_id = internal_project.id AND tenant = 'internal';
        
        -- Duplicate project_challenges
        INSERT INTO project_challenges (project_id, challenge, display_order, tenant)
        SELECT external_project_id, challenge, display_order, 'external'
        FROM project_challenges WHERE project_id = internal_project.id AND tenant = 'internal';
        
        -- Duplicate project_outcomes
        INSERT INTO project_outcomes (project_id, outcome, display_order, tenant)
        SELECT external_project_id, outcome, display_order, 'external'
        FROM project_outcomes WHERE project_id = internal_project.id AND tenant = 'internal';
        
        -- Duplicate project_screenshots
        INSERT INTO project_screenshots (project_id, file_path, alt_text, display_order, tenant, created_at)
        SELECT external_project_id, file_path, alt_text, display_order, 'external', created_at
        FROM project_screenshots WHERE project_id = internal_project.id AND tenant = 'internal';
    END LOOP;
END $$;

-- Duplicate work_experience and responsibilities
DO $$
DECLARE
    internal_exp RECORD;
    external_exp_id INTEGER;
BEGIN
    FOR internal_exp IN SELECT * FROM work_experience WHERE tenant = 'internal' LOOP
        -- Insert the experience for external tenant
        INSERT INTO work_experience (title, company, start_date, end_date, is_current, display_order, tenant, created_at, updated_at)
        VALUES (internal_exp.title, internal_exp.company, internal_exp.start_date, internal_exp.end_date, 
                internal_exp.is_current, internal_exp.display_order, 'external', internal_exp.created_at, internal_exp.updated_at)
        RETURNING id INTO external_exp_id;
        
        -- Duplicate work_responsibilities
        INSERT INTO work_responsibilities (experience_id, responsibility, display_order, tenant)
        SELECT external_exp_id, responsibility, display_order, 'external'
        FROM work_responsibilities WHERE experience_id = internal_exp.id AND tenant = 'internal';
    END LOOP;
END $$;

-- Duplicate education and courses
DO $$
DECLARE
    internal_edu RECORD;
    external_edu_id INTEGER;
BEGIN
    FOR internal_edu IN SELECT * FROM education WHERE tenant = 'internal' LOOP
        -- Insert the education for external tenant
        INSERT INTO education (degree, school, graduation_year, concentration, display_order, tenant, created_at, updated_at)
        VALUES (internal_edu.degree, internal_edu.school, internal_edu.graduation_year, internal_edu.concentration, 
                internal_edu.display_order, 'external', internal_edu.created_at, internal_edu.updated_at)
        RETURNING id INTO external_edu_id;
        
        -- Duplicate education_courses
        INSERT INTO education_courses (education_id, course_name, display_order, tenant)
        SELECT external_edu_id, course_name, display_order, 'external'
        FROM education_courses WHERE education_id = internal_edu.id AND tenant = 'internal';
    END LOOP;
END $$;

-- Duplicate tech_stack
INSERT INTO tech_stack (name, icon, level, category, display_order, show_in_portfolio, tenant, created_at, updated_at)
SELECT name, icon, level, category, display_order, show_in_portfolio, 'external', created_at, updated_at
FROM tech_stack WHERE tenant = 'internal';

-- Duplicate skill_categories and skills
DO $$
DECLARE
    internal_cat RECORD;
    external_cat_id INTEGER;
BEGIN
    FOR internal_cat IN SELECT * FROM skill_categories WHERE tenant = 'internal' LOOP
        -- Insert the category for external tenant
        INSERT INTO skill_categories (name, icon, display_order, tenant)
        VALUES (internal_cat.name, internal_cat.icon, internal_cat.display_order, 'external')
        RETURNING id INTO external_cat_id;
        
        -- Duplicate skills
        INSERT INTO skills (category_id, skill_name, display_order, tenant)
        SELECT external_cat_id, skill_name, display_order, 'external'
        FROM skills WHERE category_id = internal_cat.id AND tenant = 'internal';
    END LOOP;
END $$;

-- Duplicate process_strategy
INSERT INTO process_strategy (title, description, icon, display_order, tenant, created_at, updated_at)
SELECT title, description, icon, display_order, 'external', created_at, updated_at
FROM process_strategy WHERE tenant = 'internal';

-- Duplicate site_metrics
INSERT INTO site_metrics (performance_score, deploy_date, tenant, created_at, updated_at)
SELECT performance_score, deploy_date, 'external', created_at, updated_at
FROM site_metrics WHERE tenant = 'internal';

-- Create a table to track migration status
CREATE TABLE IF NOT EXISTS migration_status (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO migration_status (migration_name) VALUES ('003_add_tenant_support');