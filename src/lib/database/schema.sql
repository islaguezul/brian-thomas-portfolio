-- Database schema for Brian Thomas Portfolio Admin
-- Designed for Vercel Postgres

-- Personal Information (shared across portfolio and resume)
CREATE TABLE IF NOT EXISTS personal_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    bio TEXT,
    tagline VARCHAR(500),
    executive_summary TEXT,
    years_experience INTEGER DEFAULT 0,
    start_year INTEGER DEFAULT 2011,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(100),
    description TEXT,
    detailed_description TEXT,
    stage VARCHAR(50) CHECK (stage IN ('production', 'mvp', 'backend', 'concept', 'research', 'legacy')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    experimental BOOLEAN DEFAULT FALSE,
    legacy BOOLEAN DEFAULT FALSE,
    live_url VARCHAR(500),
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Technologies (many-to-many)
CREATE TABLE IF NOT EXISTS project_technologies (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL
);

-- Project Features
CREATE TABLE IF NOT EXISTS project_features (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Project Impact Metrics
CREATE TABLE IF NOT EXISTS project_impacts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    metric_key VARCHAR(100) NOT NULL,
    metric_value VARCHAR(255) NOT NULL
);

-- Project Challenges
CREATE TABLE IF NOT EXISTS project_challenges (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    challenge TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Project Outcomes
CREATE TABLE IF NOT EXISTS project_outcomes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Project Screenshots
CREATE TABLE IF NOT EXISTS project_screenshots (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Experience
CREATE TABLE IF NOT EXISTS work_experience (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Experience Responsibilities
CREATE TABLE IF NOT EXISTS work_responsibilities (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER REFERENCES work_experience(id) ON DELETE CASCADE,
    responsibility TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Education
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    degree VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    graduation_year VARCHAR(50),
    concentration VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education Courses
CREATE TABLE IF NOT EXISTS education_courses (
    id SERIAL PRIMARY KEY,
    education_id INTEGER REFERENCES education(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Tech Stack
CREATE TABLE IF NOT EXISTS tech_stack (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    level INTEGER DEFAULT 50 CHECK (level >= 0 AND level <= 100),
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    show_in_portfolio BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Categories
CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES skill_categories(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Process & Strategy Items
CREATE TABLE IF NOT EXISTS process_strategy (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site Metrics
CREATE TABLE IF NOT EXISTS site_metrics (
    id SERIAL PRIMARY KEY,
    performance_score INTEGER DEFAULT 98,
    deploy_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users (for NextAuth)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_projects_stage ON projects(stage);
CREATE INDEX idx_projects_legacy ON projects(legacy);
CREATE INDEX idx_work_experience_current ON work_experience(is_current);
CREATE INDEX idx_tech_stack_portfolio ON tech_stack(show_in_portfolio);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tables with updated_at
CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON personal_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_stack_updated_at BEFORE UPDATE ON tech_stack
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_strategy_updated_at BEFORE UPDATE ON process_strategy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_metrics_updated_at BEFORE UPDATE ON site_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();