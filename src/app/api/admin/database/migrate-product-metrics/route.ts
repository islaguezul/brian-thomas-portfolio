import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First ensure the update_updated_at_column function exists
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Execute each CREATE TABLE statement separately
    
    // Product Metrics Summary
    await sql`
      CREATE TABLE IF NOT EXISTS product_metrics_summary (
          id SERIAL PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
          total_users_impacted INTEGER DEFAULT 0,
          total_revenue_influenced DECIMAL(15,2) DEFAULT 0,
          total_cost_savings DECIMAL(15,2) DEFAULT 0,
          total_efficiency_gains DECIMAL(5,2) DEFAULT 0,
          total_nps_improvement DECIMAL(5,2) DEFAULT 0,
          total_team_members_led INTEGER DEFAULT 0,
          total_stakeholders_managed INTEGER DEFAULT 0,
          total_products_launched INTEGER DEFAULT 0,
          average_time_to_market INTEGER DEFAULT 0,
          feature_adoption_rate DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Project Product Metrics
    await sql`
      CREATE TABLE IF NOT EXISTS project_product_metrics (
          id SERIAL PRIMARY KEY,
          project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
          tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
          users_impacted INTEGER DEFAULT 0,
          user_growth_rate DECIMAL(5,2),
          dau_mau_ratio DECIMAL(5,2),
          retention_rate DECIMAL(5,2),
          revenue_impact DECIMAL(15,2),
          cost_savings DECIMAL(15,2),
          roi_percentage DECIMAL(10,2),
          payback_period_months INTEGER,
          launch_date DATE,
          time_to_market_days INTEGER,
          feature_adoption_rate DECIMAL(5,2),
          nps_score INTEGER,
          nps_improvement DECIMAL(5,2),
          customer_satisfaction DECIMAL(5,2),
          performance_improvement DECIMAL(5,2),
          system_uptime DECIMAL(5,2) DEFAULT 99.9,
          deployment_frequency VARCHAR(50),
          lead_time_hours INTEGER,
          mttr_minutes INTEGER,
          team_size INTEGER,
          stakeholders_count INTEGER,
          cross_functional_teams INTEGER,
          sprint_velocity_improvement DECIMAL(5,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Key Achievements
    await sql`
      CREATE TABLE IF NOT EXISTS key_achievements (
          id SERIAL PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
          title VARCHAR(255) NOT NULL,
          metric_value VARCHAR(100) NOT NULL,
          metric_unit VARCHAR(50),
          context TEXT,
          achievement_date DATE,
          category VARCHAR(50) CHECK (category IN ('user_impact', 'revenue', 'efficiency', 'leadership', 'innovation')),
          display_order INTEGER DEFAULT 0,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Product Strategies
    await sql`
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
      )
    `;

    // Stakeholder Impacts
    await sql`
      CREATE TABLE IF NOT EXISTS stakeholder_impacts (
          id SERIAL PRIMARY KEY,
          project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
          tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
          stakeholder_type VARCHAR(100) NOT NULL,
          impact_description TEXT NOT NULL,
          satisfaction_score DECIMAL(3,2),
          display_order INTEGER DEFAULT 0
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_product_metrics_tenant ON product_metrics_summary(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_metrics_tenant ON project_product_metrics(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_metrics_project ON project_product_metrics(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_achievements_tenant ON key_achievements(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_achievements_featured ON key_achievements(is_featured)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_strategies_project ON product_strategies(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stakeholder_project ON stakeholder_impacts(project_id)`;

    // Add triggers for updated_at
    await sql`
      CREATE TRIGGER update_product_metrics_summary_updated_at BEFORE UPDATE ON product_metrics_summary
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      CREATE TRIGGER update_project_product_metrics_updated_at BEFORE UPDATE ON project_product_metrics
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Product metrics tables created successfully' 
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to run migration: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}