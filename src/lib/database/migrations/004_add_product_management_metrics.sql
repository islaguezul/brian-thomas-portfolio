-- Add product management metrics tables for tracking professional achievements

-- Product Metrics Summary
CREATE TABLE IF NOT EXISTS product_metrics_summary (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    total_users_impacted INTEGER DEFAULT 0,
    total_revenue_influenced DECIMAL(15,2) DEFAULT 0,
    total_cost_savings DECIMAL(15,2) DEFAULT 0,
    total_efficiency_gains DECIMAL(5,2) DEFAULT 0, -- percentage
    total_nps_improvement DECIMAL(5,2) DEFAULT 0,
    total_team_members_led INTEGER DEFAULT 0,
    total_stakeholders_managed INTEGER DEFAULT 0,
    total_products_launched INTEGER DEFAULT 0,
    average_time_to_market INTEGER DEFAULT 0, -- days
    feature_adoption_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Product Metrics (extends projects table)
CREATE TABLE IF NOT EXISTS project_product_metrics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    -- User Impact
    users_impacted INTEGER DEFAULT 0,
    user_growth_rate DECIMAL(5,2), -- percentage
    dau_mau_ratio DECIMAL(5,2), -- daily/monthly active users ratio
    retention_rate DECIMAL(5,2), -- percentage
    
    -- Business Impact
    revenue_impact DECIMAL(15,2),
    cost_savings DECIMAL(15,2),
    roi_percentage DECIMAL(10,2),
    payback_period_months INTEGER,
    
    -- Product Performance
    launch_date DATE,
    time_to_market_days INTEGER,
    feature_adoption_rate DECIMAL(5,2), -- percentage
    nps_score INTEGER,
    nps_improvement DECIMAL(5,2),
    customer_satisfaction DECIMAL(5,2), -- 1-5 scale
    
    -- Technical Excellence
    performance_improvement DECIMAL(5,2), -- percentage
    system_uptime DECIMAL(5,2) DEFAULT 99.9, -- percentage
    deployment_frequency VARCHAR(50), -- daily, weekly, monthly
    lead_time_hours INTEGER,
    mttr_minutes INTEGER, -- mean time to recovery
    
    -- Team & Process
    team_size INTEGER,
    stakeholders_count INTEGER,
    cross_functional_teams INTEGER,
    sprint_velocity_improvement DECIMAL(5,2), -- percentage
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key Achievements (for highlighting in dashboard)
CREATE TABLE IF NOT EXISTS key_achievements (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    title VARCHAR(255) NOT NULL,
    metric_value VARCHAR(100) NOT NULL,
    metric_unit VARCHAR(50), -- users, revenue, percentage, etc.
    context TEXT,
    achievement_date DATE,
    category VARCHAR(50) CHECK (category IN ('user_impact', 'revenue', 'efficiency', 'leadership', 'innovation')),
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Strategy & Roadmap Items
CREATE TABLE IF NOT EXISTS product_strategies (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    strategy_type VARCHAR(50) CHECK (strategy_type IN ('vision', 'goal', 'initiative', 'hypothesis', 'experiment')),
    description TEXT NOT NULL,
    success_criteria TEXT,
    actual_outcome TEXT,
    status VARCHAR(50) CHECK (status IN ('planned', 'in_progress', 'completed', 'validated', 'invalidated')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholder Impact
CREATE TABLE IF NOT EXISTS stakeholder_impacts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    stakeholder_type VARCHAR(100) NOT NULL, -- executive, engineering, sales, customer, partner
    impact_description TEXT NOT NULL,
    satisfaction_score DECIMAL(3,2), -- 1-5 scale
    display_order INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_product_metrics_tenant ON product_metrics_summary(tenant_id);
CREATE INDEX idx_project_metrics_tenant ON project_product_metrics(tenant_id);
CREATE INDEX idx_project_metrics_project ON project_product_metrics(project_id);
CREATE INDEX idx_achievements_tenant ON key_achievements(tenant_id);
CREATE INDEX idx_achievements_featured ON key_achievements(is_featured);
CREATE INDEX idx_strategies_project ON product_strategies(project_id);
CREATE INDEX idx_stakeholder_project ON stakeholder_impacts(project_id);

-- Add triggers for updated_at
CREATE TRIGGER update_product_metrics_summary_updated_at BEFORE UPDATE ON product_metrics_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_product_metrics_updated_at BEFORE UPDATE ON project_product_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();