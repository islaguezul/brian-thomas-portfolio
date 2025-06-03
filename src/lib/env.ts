// Helper to load environment variables with fallback support
// Checks .env.development.local first (for Vercel Postgres), then .env.local

export function getEnvVar(key: string): string | undefined {
  // In production, all env vars are already loaded
  if (process.env.NODE_ENV === 'production') {
    return process.env[key];
  }

  // In development, Next.js automatically loads from multiple .env files
  // The order is: .env.development.local > .env.local > .env.development > .env
  return process.env[key];
}

// Database configuration
// The db.ts file maps Vercel's POSTGRES_POSTGRES_* variables to standard POSTGRES_* names
export const databaseConfig = {
  url: getEnvVar('POSTGRES_URL'),
  prismaUrl: getEnvVar('POSTGRES_PRISMA_URL'),
  urlNoSSL: getEnvVar('POSTGRES_URL_NO_SSL'),
  urlNonPooling: getEnvVar('POSTGRES_URL_NON_POOLING'),
  user: getEnvVar('POSTGRES_USER'),
  host: getEnvVar('POSTGRES_HOST'),
  password: getEnvVar('POSTGRES_PASSWORD'),
  database: getEnvVar('POSTGRES_DATABASE'),
};

// Auth configuration (from .env.local)
export const authConfig = {
  nextAuthUrl: getEnvVar('NEXTAUTH_URL') || 'http://localhost:3000',
  nextAuthSecret: getEnvVar('NEXTAUTH_SECRET'),
  githubId: getEnvVar('GITHUB_ID'),
  githubSecret: getEnvVar('GITHUB_SECRET'),
  adminGithubId: getEnvVar('ADMIN_GITHUB_ID'),
};

// OpenAI configuration (from .env.local)
export const openAIConfig = {
  apiKey: getEnvVar('OPENAI_API_KEY'),
};