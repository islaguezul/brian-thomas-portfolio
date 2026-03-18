-- Migration 006: Add professional case studies tables
-- Run this migration via the admin panel's Database section

-- Main case studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id SERIAL PRIMARY KEY,
  tenant VARCHAR(50) NOT NULL DEFAULT 'internal',
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  summary TEXT,
  problem TEXT,
  -- context fields (flattened from JSON)
  industry VARCHAR(255),
  org_scale VARCHAR(255),
  team_scope VARCHAR(255),
  timeline VARCHAR(255),
  stakeholder_count VARCHAR(255),
  -- complexity signals
  ambiguity VARCHAR(10),
  ambiguity_detail TEXT,
  technical_depth VARCHAR(10),
  technical_depth_detail TEXT,
  organizational_complexity VARCHAR(10),
  organizational_complexity_detail TEXT,
  regulatory_constraints VARCHAR(10),
  regulatory_constraints_detail TEXT,
  -- metadata
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approach steps (ordered list of what the TPM did)
CREATE TABLE IF NOT EXISTS case_study_approaches (
  id SERIAL PRIMARY KEY,
  case_study_id INT NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  tenant VARCHAR(50) NOT NULL DEFAULT 'internal',
  step_text TEXT NOT NULL,
  display_order INT DEFAULT 0
);

-- Outcomes (metric + result + optional context)
CREATE TABLE IF NOT EXISTS case_study_outcomes (
  id SERIAL PRIMARY KEY,
  case_study_id INT NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  tenant VARCHAR(50) NOT NULL DEFAULT 'internal',
  metric VARCHAR(255) NOT NULL,
  result TEXT NOT NULL,
  context TEXT,
  display_order INT DEFAULT 0
);

-- Skills demonstrated (simple list)
CREATE TABLE IF NOT EXISTS case_study_skills (
  id SERIAL PRIMARY KEY,
  case_study_id INT NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  tenant VARCHAR(50) NOT NULL DEFAULT 'internal',
  skill VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0
);

-- Indexes for tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_case_studies_tenant ON case_studies(tenant);
CREATE INDEX IF NOT EXISTS idx_case_study_approaches_case_study_id ON case_study_approaches(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_outcomes_case_study_id ON case_study_outcomes(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_skills_case_study_id ON case_study_skills(case_study_id);
