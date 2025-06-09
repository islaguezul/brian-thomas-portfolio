import GithubProvider from 'next-auth/providers/github';
import { sql } from '@vercel/postgres';
import type { NextAuthOptions } from 'next-auth';

// Determine which GitHub credentials to use based on Vercel deployment
function getGitHubCredentials() {
  // In production, use VERCEL_URL to determine which tenant we're on
  const deploymentUrl = process.env.VERCEL_URL || process.env.NEXTAUTH_URL || '';
  
  console.log('=== AUTH DEBUG ===');
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('Deployment URL for auth:', deploymentUrl);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('GITHUB_ID_TENANT2 exists:', !!process.env.GITHUB_ID_TENANT2);
  console.log('GITHUB_SECRET_TENANT2 exists:', !!process.env.GITHUB_SECRET_TENANT2);
  console.log('GITHUB_ID exists:', !!process.env.GITHUB_ID);
  console.log('GITHUB_SECRET exists:', !!process.env.GITHUB_SECRET);
  console.log('Testing brianthomastpm detection:', deploymentUrl.includes('brianthomastpm.com'));
  
  // Check if this deployment is for the external tenant (handle both www and non-www)
  if (deploymentUrl.includes('brianthomastpm.com') || deploymentUrl.includes('www.brianthomastpm.com')) {
    console.log('✅ Using TENANT2 credentials for brianthomastpm.com deployment');
    console.log('TENANT2 Client ID:', process.env.GITHUB_ID_TENANT2?.substring(0, 8) + '...');
    return {
      clientId: process.env.GITHUB_ID_TENANT2!,
      clientSecret: process.env.GITHUB_SECRET_TENANT2!,
    };
  }
  
  // Default to internal tenant
  console.log('✅ Using default credentials for briantpm.com deployment');
  console.log('Default Client ID:', process.env.GITHUB_ID?.substring(0, 8) + '...');
  return {
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  };
}

// Function to get the appropriate base URL
function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  
  const deploymentUrl = process.env.VERCEL_URL || '';
  
  if (deploymentUrl.includes('brianthomastpm.com')) {
    return 'https://www.brianthomastpm.com';
  }
  
  return 'https://briantpm.com';
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider(getGitHubCredentials()),
  ],
  // Use appropriate URL based on deployment
  ...(process.env.NODE_ENV === 'production' && {
    url: getBaseUrl(),
  }),
  callbacks: {
    async redirect({ url, baseUrl }) {
      // For production, use the correct domain based on deployment
      if (process.env.NODE_ENV === 'production') {
        const correctDomain = getBaseUrl();
        
        // If it's a relative URL, use the correct domain
        if (url.startsWith('/')) {
          return `${correctDomain}${url}`;
        }
        
        // If it's an absolute URL but wrong domain, fix it
        if (url.includes('/admin') || url.includes('auth')) {
          return url.replace(baseUrl, correctDomain);
        }
      }
      
      // Default behavior for development
      return url.startsWith('/') ? `${baseUrl}${url}` : url;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'github') {
        // Check if this GitHub user is allowed
        const adminGithubId = process.env.ADMIN_GITHUB_ID;
        const githubProfile = profile as { id?: string | number };
        
        // Convert both to strings for comparison (GitHub returns number, env is string)
        const userIdString = String(githubProfile?.id);
        const adminIdString = String(adminGithubId);
        
        if (userIdString !== adminIdString) {
          return false;
        }

        try {
          // Update or insert admin user
          await sql`
            INSERT INTO admin_users (github_id, email, name, avatar_url, last_login)
            VALUES (${githubProfile.id}, ${user.email}, ${user.name}, ${user.image}, NOW())
            ON CONFLICT (github_id) 
            DO UPDATE SET 
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              avatar_url = EXCLUDED.avatar_url,
              last_login = NOW()
          `;
        } catch (error) {
          console.error('Error updating admin user:', error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};