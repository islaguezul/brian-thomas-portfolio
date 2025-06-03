import GithubProvider from 'next-auth/providers/github';
import { sql } from '@vercel/postgres';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
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