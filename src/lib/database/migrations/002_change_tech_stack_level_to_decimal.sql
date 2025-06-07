-- Migration 002: Change tech_stack level column from INTEGER to DECIMAL to support 0.5 years

-- First check if migration has already been applied
DO $$
BEGIN
    -- Check if column is already decimal
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tech_stack' 
        AND column_name = 'level' 
        AND data_type = 'numeric'
    ) THEN
        RAISE NOTICE 'Migration 002 already applied - tech_stack.level is already decimal';
        RETURN;
    END IF;
    
    -- Change column type
    ALTER TABLE tech_stack ALTER COLUMN level TYPE DECIMAL(5,2);
    
    -- Add constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tech_stack_level_check'
    ) THEN
        ALTER TABLE tech_stack ADD CONSTRAINT tech_stack_level_check CHECK (level >= 0 AND level <= 100);
    END IF;
    
    RAISE NOTICE 'Migration 002 completed successfully';
END $$;