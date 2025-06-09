import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest } from 'next/server';
import GithubProvider from 'next-auth/providers/github';

async function handler(req: NextRequest) {
  const host = req.headers.get('host') || '';
  console.log('=== NEXTAUTH HANDLER DEBUG ===');
  console.log('Request host:', host);
  console.log('Request URL:', req.url);
  
  // Create dynamic auth options based on the actual request host
  const dynamicAuthOptions = {
    ...authOptions,
    providers: [
      GithubProvider({
        clientId: host.includes('brianthomastpm.com') 
          ? process.env.GITHUB_ID_TENANT2!
          : process.env.GITHUB_ID!,
        clientSecret: host.includes('brianthomastpm.com')
          ? process.env.GITHUB_SECRET_TENANT2!
          : process.env.GITHUB_SECRET!,
      }),
    ],
    // Ensure the callback URL matches what's configured in GitHub
    ...(process.env.NODE_ENV === 'production' && host.includes('brianthomastpm.com') && {
      url: 'https://www.brianthomastpm.com',
    }),
  };
  
  console.log('Using credentials for:', host.includes('brianthomastpm.com') ? 'TENANT2' : 'DEFAULT');
  console.log('Client ID:', (host.includes('brianthomastpm.com') 
    ? process.env.GITHUB_ID_TENANT2 
    : process.env.GITHUB_ID)?.substring(0, 8) + '...');
  console.log('Auth URL set to:', dynamicAuthOptions.url || 'default');
  console.log('Expected callback URL: https://' + host + '/api/auth/callback/github');
  
  return NextAuth(dynamicAuthOptions)(req);
}

export { handler as GET, handler as POST };