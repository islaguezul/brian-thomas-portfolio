import { requireAuth } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import { UpdateNotification } from '@/components/UpdateNotification';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      <UpdateNotification />
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}