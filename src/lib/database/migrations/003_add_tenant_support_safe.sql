-- Migration 003: Add tenant support to all tables (SAFE VERSION)
-- This migration adds a 'tenant' column to all content tables and duplicates existing data

-- Check if tenant columns already exist before proceeding
DO $$
DECLARE
    tenant_exists boolean;
BEGIN
    -- Check if tenant column already exists in personal_info table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'personal_info' AND column_name = 'tenant'
    ) INTO tenant_exists;
    
    IF tenant_exists THEN
        RAISE NOTICE 'Migration 003 already partially applied - tenant columns exist';
        RETURN;
    END IF;

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

    RAISE NOTICE 'Added tenant columns to all tables';
END $$;

-- Add check constraints safely (only if they don't exist)
DO $$
BEGIN
    -- Add constraints one by one, ignoring if they already exist
    BEGIN
        ALTER TABLE personal_info ADD CONSTRAINT personal_info_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL; -- Ignore if constraint already exists
    END;
    
    BEGIN
        ALTER TABLE projects ADD CONSTRAINT projects_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE project_technologies ADD CONSTRAINT project_technologies_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE project_features ADD CONSTRAINT project_features_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE project_impacts ADD CONSTRAINT project_impacts_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE project_challenges ADD CONSTRAINT project_challenges_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE project_outcomes ADD CONSTRAINT project_outcomes_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE project_screenshots ADD CONSTRAINT project_screenshots_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE work_experience ADD CONSTRAINT work_experience_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE work_responsibilities ADD CONSTRAINT work_responsibilities_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE education ADD CONSTRAINT education_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE education_courses ADD CONSTRAINT education_courses_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE tech_stack ADD CONSTRAINT tech_stack_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE skill_categories ADD CONSTRAINT skill_categories_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE skills ADD CONSTRAINT skills_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE process_strategy ADD CONSTRAINT process_strategy_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    BEGIN
        ALTER TABLE site_metrics ADD CONSTRAINT site_metrics_tenant_check CHECK (tenant IN ('internal', 'external'));
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

-- Create indexes safely
DO $$
BEGIN
    -- Create indexes one by one, ignoring if they already exist
    BEGIN
        CREATE INDEX idx_personal_info_tenant ON personal_info(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_projects_tenant ON projects(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_project_technologies_tenant ON project_technologies(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_project_features_tenant ON project_features(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_project_impacts_tenant ON project_impacts(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_project_challenges_tenant ON project_challenges(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_project_outcomes_tenant ON project_outcomes(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_project_screenshots_tenant ON project_screenshots(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_work_experience_tenant ON work_experience(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_work_responsibilities_tenant ON work_responsibilities(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_education_tenant ON education(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_education_courses_tenant ON education_courses(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_tech_stack_tenant ON tech_stack(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_skill_categories_tenant ON skill_categories(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_skills_tenant ON skills(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_process_strategy_tenant ON process_strategy(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_site_metrics_tenant ON site_metrics(tenant);
    EXCEPTION WHEN duplicate_table THEN
        NULL;
    END;
END $$;

-- Duplicate existing data for external tenant (only if not already done)
DO $$
DECLARE
    external_count INTEGER;
    internal_project RECORD;
    external_project_id INTEGER;
BEGIN
    -- Check if external tenant data already exists
    SELECT COUNT(*) INTO external_count FROM personal_info WHERE tenant = 'external';
    
    IF external_count > 0 THEN
        RAISE NOTICE 'External tenant data already exists, skipping duplication';
        RETURN;
    END IF;

    -- Duplicate personal_info
    INSERT INTO personal_info (name, title, email, phone, location, linkedin_url, github_url, bio, tagline, executive_summary, years_experience, start_year, tenant, created_at, updated_at)
    SELECT name, title, email, phone, location, linkedin_url, github_url, bio, tagline, executive_summary, years_experience, start_year, 'external', created_at, updated_at
    FROM personal_info WHERE tenant = 'internal';

    -- Duplicate projects and related tables
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

    RAISE NOTICE 'Migration 003 completed successfully';
END $$;