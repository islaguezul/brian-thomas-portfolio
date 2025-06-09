import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type Tenant = 'internal' | 'external';

function getTenantFromHostname(hostname: string): Tenant {
  // Handle localhost and development environments
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Default to internal for local development
    // Can be overridden with ?tenant=external query param
    return 'internal';
  }
  
  // Production tenant detection
  if (hostname.includes('brianthomastpm.com')) {
    return 'external';
  }
  
  // Default to internal for briantpm.com and all other domains
  return 'internal';
}

// Custom middleware that handles redirects and auth
export default withAuth(
  function middleware(req: NextRequest) {
    const hostname = req.headers.get('host') || '';
    const { pathname } = req.nextUrl;
    
    // Redirect external domain admin to internal domain admin BEFORE auth check
    if (hostname.includes('brianthomastpm.com') && pathname.startsWith('/admin')) {
      return NextResponse.redirect('https://briantpm.com' + pathname, 301);
    }
    
    const tenant = getTenantFromHostname(hostname);
    
    // Allow query param override for local testing
    const searchParams = new URL(req.url).searchParams;
    const tenantOverride = searchParams.get('tenant');
    const finalTenant = (tenantOverride === 'external' || tenantOverride === 'internal') 
      ? tenantOverride 
      : tenant;
    
    // Clone the request headers and add tenant
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-tenant', finalTenant);
    
    // Create response with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Also set tenant in response headers for client access
    response.headers.set('x-tenant', finalTenant);
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const hostname = req.headers.get('host') || '';
        
        // Skip auth check for external domain admin paths (they will be redirected)
        if (hostname.includes('brianthomastpm.com') && pathname.startsWith('/admin')) {
          return true;
        }
        
        // Admin routes require authentication
        if (pathname.startsWith('/admin')) {
          return !!token;
        }
        
        // All other routes are public
        return true;
      },
    },
  }
);

export const config = {
  // Apply middleware to all routes except static files and api routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};