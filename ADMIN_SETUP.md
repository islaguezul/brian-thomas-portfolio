# Admin Panel Setup Guide

## Environment Variables

This project uses two environment files:

### 1. `.env.development.local` (Database - Created by Vercel)
When you connect a Neon database through Vercel, it automatically creates this file with your Postgres credentials. If setting up manually, copy `.env.development.local.example` and fill in the values from your Vercel dashboard.

### 2. `.env.local` (Auth & APIs)
Copy `.env.local.example` and configure:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-random-secret>

# GitHub OAuth
GITHUB_ID=<your-github-oauth-app-id>
GITHUB_SECRET=<your-github-oauth-app-secret>

# Admin Access
ADMIN_GITHUB_ID=<your-github-user-id>

# OpenAI
OPENAI_API_KEY=<your-openai-api-key>

# Pusher (optional - for real-time updates)
# If not configured, the app will use polling instead
# PUSHER_APP_ID=<your-pusher-app-id>
# PUSHER_SECRET=<your-pusher-secret>
# NEXT_PUBLIC_PUSHER_KEY=<your-pusher-key>
# NEXT_PUBLIC_PUSHER_CLUSTER=<your-pusher-cluster>
```

## Setup Steps

1. **✅ Create Neon Database in Vercel** (You've already done this!)
   - Database name: "portfolio"
   - All environments enabled
   - Vercel creates variables with `POSTGRES_POSTGRES_*` prefix

2. **✅ Pull Environment Variables** (You've already done this!)
   ```bash
   vercel env pull .env.development.local
   ```
   This created the file with all your Postgres connection strings.

3. **Create GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Set callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Secret to `.env.local`

4. **Get Your GitHub User ID**
   ```bash
   curl https://api.github.com/users/YOUR_USERNAME
   ```
   Look for the "id" field and add to `ADMIN_GITHUB_ID`

5. **Optional: Create Pusher App (for instant real-time updates)**
   - Go to https://pusher.com and sign up/login
   - Create a new app
   - Choose a cluster closest to your users
   - Copy credentials to `.env.local`
   - Note: If skipped, the app will use polling (30-second intervals)

6. **Initialize Database**
   - Run `npm run dev`
   - Visit `http://localhost:3000/admin/database`
   - Click "Initialize Database"
   - Click "Seed Database"

7. **Access Admin Panel**
   - Visit `http://localhost:3000/admin`
   - Sign in with your GitHub account

## Production Deployment

In production, all environment variables are automatically available from Vercel. Just ensure:
- Your GitHub OAuth app has the production callback URL
- `NEXTAUTH_URL` is set to your production domain
- Database is initialized in production environment