# Development Environment Setup - IMPORTANT

## ⚠️ Critical: Separate Development Database

**Your development environment is currently using the same database as production!** This is dangerous and can lead to data loss or corruption in your live site.

## Setting Up a Separate Development Database

### Option 1: Create a Separate Neon Database (Recommended)

1. **Create a new Neon database for development:**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project named "brian-thomas-portfolio-dev"
   - Copy the connection strings

2. **Update your `.env.development.local` file:**
   ```bash
   # Replace these with your DEV database credentials
   POSTGRES_POSTGRES_URL="postgres://[dev-credentials]"
   POSTGRES_POSTGRES_PRISMA_URL="postgres://[dev-credentials]?pgbouncer=true&connect_timeout=15"
   POSTGRES_POSTGRES_URL_NO_SSL="postgres://[dev-credentials]"
   POSTGRES_POSTGRES_URL_NON_POOLING="postgres://[dev-credentials]"
   ```

3. **Initialize the dev database:**
   ```bash
   npm run dev
   # Go to http://localhost:3000/admin/database
   # Click "Initialize Database" to set up tables
   # Click "Seed Sample Data" to add test data
   ```

### Option 2: Use Local PostgreSQL

1. **Install PostgreSQL locally:**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Create database
   createdb brian_thomas_portfolio_dev
   ```

2. **Update `.env.development.local`:**
   ```bash
   POSTGRES_POSTGRES_URL="postgres://localhost:5432/brian_thomas_portfolio_dev"
   POSTGRES_POSTGRES_PRISMA_URL="postgres://localhost:5432/brian_thomas_portfolio_dev"
   POSTGRES_POSTGRES_URL_NO_SSL="postgres://localhost:5432/brian_thomas_portfolio_dev"
   POSTGRES_POSTGRES_URL_NON_POOLING="postgres://localhost:5432/brian_thomas_portfolio_dev"
   ```

### Option 3: Use Docker

1. **Create `docker-compose.yml`:**
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: brian_thomas_portfolio_dev
         POSTGRES_PASSWORD: devpassword
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Update `.env.development.local`:**
   ```bash
   POSTGRES_POSTGRES_URL="postgres://postgres:devpassword@localhost:5432/brian_thomas_portfolio_dev"
   # ... repeat for other POSTGRES variables
   ```

## Verifying Your Setup

1. **Check which database you're connected to:**
   - In development, check the admin panel header
   - Look for database connection info in console logs

2. **Test with dummy data:**
   - Create a test project in the admin panel
   - Verify it doesn't appear in production

## Environment File Priority

Next.js loads environment files in this order:
1. `.env.development.local` (for dev-specific settings)
2. `.env.local` (for all environments)
3. `.env.development` (committed dev defaults)
4. `.env` (committed defaults)

**Never commit `.env.development.local` or `.env.local` files!**

## Quick Switch Between Environments

To quickly verify which database you're using:

```javascript
// Add this temporarily to any page
console.log('Database Host:', process.env.POSTGRES_HOST);
console.log('Database Name:', process.env.POSTGRES_DATABASE);
```

## Backup Production Data

Before making any changes, backup your production data:

1. **Export from Neon Console:**
   - Go to your production project in Neon
   - Use the "Backup" feature
   - Download the SQL dump

2. **Import to Dev (Optional):**
   ```bash
   psql your_dev_database < production_backup.sql
   ```

## Tenant System in Development

The multi-tenant system works the same in development:
- Default tenant: 'default'
- Use the tenant switcher in admin to test different tenants
- Each tenant's data is isolated

## Safety Checklist

- [ ] Created separate development database
- [ ] Updated `.env.development.local` with dev credentials
- [ ] Verified NOT using production database (check connection string)
- [ ] Initialized dev database schema
- [ ] Added test data to dev database
- [ ] Tested that changes in dev don't affect production

## Common Issues

**"Database not initialized" error:**
- Go to `/admin/database` and click "Initialize Database"

**"Permission denied" errors:**
- Check database user permissions
- Ensure connection string is correct

**Changes appearing in production:**
- You're still using the production database!
- Double-check your `.env.development.local` file
- Restart the dev server after changing env files

## Emergency: If You Accidentally Modified Production

1. Check what was changed in the admin panel
2. Use the tenant system to isolate changes if possible
3. Restore from Neon backups if needed
4. Set up proper dev environment immediately

---

Remember: **Always use a separate database for development!** This protects your production data and allows you to test freely.