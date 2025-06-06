# Brian Thomas Portfolio

A modern, full-stack portfolio website with an integrated admin panel for content management.

## 🚨 IMPORTANT: Development Setup

**⚠️ WARNING: By default, the development environment may use the same database as production!**

Before starting development, you MUST set up a separate development database to avoid affecting your live site data.

**[Read the Development Setup Guide](./DEV_SETUP.md)** - This is critical for safe development!

## Quick Start

1. **Set up environment variables:**
   ```bash
   # Copy the example files
   cp .env.local.example .env.local
   cp .env.development.local.example .env.development.local
   ```

2. **Configure your development database:**
   - Follow the [DEV_SETUP.md](./DEV_SETUP.md) guide
   - Use a separate Neon database, local PostgreSQL, or Docker

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Initialize the database:**
   - Visit http://localhost:3000/admin/database
   - Click "Initialize Database"
   - Optionally click "Seed Sample Data"

## Features

### Public Portfolio
- Modern, responsive design
- Real-time content updates
- Interactive project showcases
- Professional resume section
- Tech stack visualization
- Contact information

### Admin Panel (/admin)
- **Projects Management**: Add, edit, delete projects with rich details
- **Resume Management**: Manage work experience and education
- **Skills Management**: Organize professional skills by category
- **Tech Stack**: Showcase technologies with experience levels
- **Personal Info**: Update bio, contact details, and professional summary
- **AI Enhancement**: Use AI to improve content quality
- **Multi-tenant Support**: Manage multiple portfolio versions

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   └── page.tsx           # Main portfolio page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   └── Portfolio.tsx     # Main portfolio component
├── lib/                   # Utilities and libraries
│   ├── database/         # Database queries and schema
│   ├── auth.ts           # Authentication logic
│   └── tenant.ts         # Multi-tenant support
└── middleware.ts          # Request middleware
```

## Environment Variables

### Required in `.env.local`:
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `GITHUB_ID` - GitHub OAuth app ID
- `GITHUB_SECRET` - GitHub OAuth app secret
- `ADMIN_GITHUB_ID` - Your GitHub user ID for admin access
- `OPENAI_API_KEY` - For AI content enhancement

### Required in `.env.development.local`:
- `POSTGRES_*` - Development database credentials (see DEV_SETUP.md)

### Optional:
- `PUSHER_*` - For real-time updates (falls back to polling)

## Admin Access

1. Create a GitHub OAuth app:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Set callback URL to `http://localhost:3000/api/auth/callback/github`
   
2. Find your GitHub user ID:
   - Visit: https://api.github.com/users/YOUR_USERNAME
   - Copy the `id` field

3. Add credentials to `.env.local`

4. Sign in at `/admin`

## Database Management

### Schema Updates
- Migrations are in `src/lib/database/migrations/`
- Run migrations from `/admin/database`

### Multi-tenant System
- Each tenant has isolated data
- Switch tenants using the admin header dropdown
- Default tenant: 'default'

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Connect Neon Postgres database
5. Deploy

### Database Setup
1. Vercel will create a Neon database
2. Run `vercel env pull` to get credentials
3. Visit `/admin/database` to initialize

## Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Troubleshooting

### "Database not initialized"
- Go to `/admin/database`
- Click "Initialize Database"

### "Permission denied" on admin pages
- Ensure your GitHub ID is in `ADMIN_GITHUB_ID`
- Check you're signed in with the correct GitHub account

### Changes affecting production
- You're using the production database!
- Set up a dev database immediately (see DEV_SETUP.md)

## Security Notes

- Admin panel requires GitHub authentication
- Only specified GitHub user ID has access
- Database operations are tenant-scoped
- Environment variables are never exposed to client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Set up separate dev database
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## License

This project is private and proprietary. All rights reserved.