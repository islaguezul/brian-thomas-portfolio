import CaseStudiesPage from '@v2/pages/CaseStudiesPage'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getCaseStudies, getPersonalInfo } from '@/lib/database/db'
import type { Tenant } from '@/middleware'

export const metadata: Metadata = {
  title: 'Case Studies | Brian Thomas',
  description: 'Professional case studies from Technical Program Management leadership.',
}

export default async function CaseStudiesRoute() {
  const headersList = await headers()
  const tenant = (headersList.get('x-tenant') || 'internal') as Tenant
  const [caseStudies, personalInfo] = await Promise.all([
    getCaseStudies(tenant).catch(() => []),
    getPersonalInfo(tenant).catch(() => null),
  ])

  return <CaseStudiesPage initialCaseStudies={caseStudies} contactEmail={personalInfo?.email} />
}
