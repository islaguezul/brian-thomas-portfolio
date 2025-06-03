'use client';

import { signIn } from 'next-auth/react';
import { Github, Shield, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function AdminLogin() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Admin Access
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Secure authentication required
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">
                {error === 'OAuthSignin' && 'Error connecting to GitHub'}
                {error === 'OAuthCallback' && 'GitHub authentication failed'}
                {error === 'AccessDenied' && 'Access denied. Unauthorized GitHub account.'}
                {error === 'Default' && 'An error occurred during authentication'}
              </p>
            </div>
          )}

          <button
            onClick={() => signIn('github', { callbackUrl: '/admin' })}
            className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>Protected by NextAuth.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}