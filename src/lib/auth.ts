import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}