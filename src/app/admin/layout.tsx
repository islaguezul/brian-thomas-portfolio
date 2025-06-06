import { requireAuth } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import TenantSwitcher from '@/components/admin/TenantSwitcher';
import { UpdateNotification } from '@/components/UpdateNotification';
import { TenantProvider } from '@/lib/tenant-context';
import { getTenant } from '@/lib/tenant';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const tenant = await getTenant();

  return (
    <TenantProvider tenant={tenant}>
      <div className="min-h-screen bg-gray-950">
        <UpdateNotification />
        <AdminNav />
        <TenantSwitcher />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </TenantProvider>
  );
}