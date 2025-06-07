import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { getTenantFromHeaders } from '@/lib/tenant';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';
import { getTechStack } from '@/lib/database/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    // Get tenants from different sources
    const adminTenant = getAdminTenant(request.headers);
    const publicTenant = getTenantFromHeaders(request.headers);
    const serverTenant = await getAdminSelectedTenant();
    
    // Get tech stack data for each tenant
    const [adminData, publicData, serverData] = await Promise.all([
      getTechStack(adminTenant),
      getTechStack(publicTenant), 
      getTechStack(serverTenant)
    ]);
    
    return NextResponse.json({
      tenants: {
        admin: adminTenant,
        public: publicTenant,
        server: serverTenant
      },
      data: {
        admin: { count: adminData.length, items: adminData.map(t => ({ id: t.id, name: t.name })) },
        public: { count: publicData.length, items: publicData.map(t => ({ id: t.id, name: t.name })) },
        server: { count: serverData.length, items: serverData.map(t => ({ id: t.id, name: t.name })) }
      },
      headers: {
        'x-admin-tenant': request.headers.get('x-admin-tenant'),
        'x-tenant': request.headers.get('x-tenant'),
        'user-agent': request.headers.get('user-agent')?.substring(0, 50) + '...'
      }
    });
  } catch (error) {
    console.error('Error in tech stack tenant debug:', error);
    return NextResponse.json(
      { error: 'Failed to debug tech stack tenants' },
      { status: 500 }
    );
  }
}