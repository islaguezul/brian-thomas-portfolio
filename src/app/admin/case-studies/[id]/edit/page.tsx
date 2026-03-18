import { notFound } from 'next/navigation';
import Link from 'next/link';
import CaseStudyForm from '@/components/admin/CaseStudyForm';
import { getCaseStudy } from '@/lib/database/db';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';

export default async function EditCaseStudy({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getAdminSelectedTenant();
  const caseStudy = await getCaseStudy(tenant, parseInt(id));

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="p-8">
      <Link href="/admin/case-studies" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
        &#8592; Back to Case Studies
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">Edit Case Study</h1>
      <CaseStudyForm caseStudy={caseStudy} />
    </div>
  );
}
