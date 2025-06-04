-- Migration 002: Change tech_stack level column from INTEGER to DECIMAL to support 0.5 years
ALTER TABLE tech_stack ALTER COLUMN level TYPE DECIMAL(5,2) CHECK (level >= 0 AND level <= 100);