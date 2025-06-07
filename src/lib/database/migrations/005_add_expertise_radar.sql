-- Add expertise radar table for customizable skills visualization

CREATE TABLE IF NOT EXISTS expertise_radar (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    skill_name VARCHAR(100) NOT NULL,
    skill_level DECIMAL(3,1) NOT NULL CHECK (skill_level >= 0 AND skill_level <= 10),
    category VARCHAR(100),
    description TEXT,
    color VARCHAR(7) DEFAULT '#8884d8', -- hex color for visualization
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expertise_radar_tenant') THEN
        CREATE INDEX idx_expertise_radar_tenant ON expertise_radar(tenant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expertise_radar_active') THEN
        CREATE INDEX idx_expertise_radar_active ON expertise_radar(is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expertise_radar_order') THEN
        CREATE INDEX idx_expertise_radar_order ON expertise_radar(display_order);
    END IF;
END $$;

-- Add trigger for updated_at (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_expertise_radar_updated_at BEFORE UPDATE ON expertise_radar
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Trigger already exists, ignore
        NULL;
END $$;