# Production Database Migration Plan

## Overview
The production database needs to be updated to match the development database structure to support multi-tenancy and new features.

## Required Migrations (in order)

### 1. Base Schema Setup
```bash
# Run the complete schema setup first (if tables don't exist)
POST /api/admin/database/initialize
```

### 2. Migration 001 - Screenshot File Path Size
File: `src/lib/database/migrations/001_increase_screenshot_file_path_size.sql`
- Increases `project_screenshots.file_path` from VARCHAR(500) to TEXT

### 3. Migration 002 - Tech Stack Level to Decimal
File: `src/lib/database/migrations/002_change_tech_stack_level_to_decimal.sql`
- Changes `tech_stack.level` from INTEGER to DECIMAL(5,2)
- Adds constraint check for level 0-100

### 4. Migration 003 - Add Tenant Support (CRITICAL)
File: `src/lib/database/migrations/003_add_tenant_support.sql`
- Adds `tenant` column to all content tables
- Creates 'internal' and 'external' tenant separation
- Duplicates existing data for both tenants
- Adds tenant indexes and constraints

### 5. Migration 004 - Product Management Metrics
File: `src/lib/database/migrations/004_add_product_management_metrics.sql`
- Adds product metrics tracking tables
- Creates achievement and strategy tables

### 6. Migration 005 - Expertise Radar
File: `src/lib/database/migrations/005_add_expertise_radar.sql`
- Adds expertise radar visualization table

## Deployment Steps

### Pre-Migration Backup
```sql
-- Create backup of production data
pg_dump $POSTGRES_URL > production_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Execute Migrations
Run each migration file in sequence using psql:

```bash
# Connect to production database
psql $POSTGRES_URL

# Run each migration file
\i src/lib/database/migrations/001_increase_screenshot_file_path_size.sql
\i src/lib/database/migrations/002_change_tech_stack_level_to_decimal.sql
\i src/lib/database/migrations/003_add_tenant_support.sql
\i src/lib/database/migrations/004_add_product_management_metrics.sql
\i src/lib/database/migrations/005_add_expertise_radar.sql
```

### Alternative: Use API Endpoints
If you prefer using the admin interface:

1. Deploy the new code to production
2. Use admin database management tools to run migrations
3. Verify data integrity

## Data Verification

After migration, verify:

1. All tables have `tenant` columns with proper constraints
2. Data exists for both 'internal' and 'external' tenants
3. Product metrics tables are created
4. Expertise radar table exists
5. All existing content is preserved and duplicated

## Risk Mitigation

1. **Backup**: Always backup before migration
2. **Test**: Run migrations on a staging environment first
3. **Rollback Plan**: Have rollback scripts ready
4. **Monitoring**: Monitor application after deployment

## Environment Variables

Ensure these are set in production:
- `POSTGRES_URL` or `POSTGRES_DATABASE_URL`
- `POSTGRES_URL_NON_POOLING` or `POSTGRES_DATABASE_URL_UNPOOLED`

## Post-Migration

1. Test multi-tenant functionality
2. Verify admin interface works
3. Check both internal and external portfolio views
4. Confirm all data is accessible

## Emergency Rollback

If issues occur:
```bash
# Restore from backup
psql $POSTGRES_URL < production_backup_YYYYMMDD_HHMMSS.sql
```

**Note**: Once migration 003 runs, the old codebase will no longer work as it expects the original schema without tenant columns.