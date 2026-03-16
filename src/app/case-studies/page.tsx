import ProjectsPage from '@v2/pages/ProjectsPage'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getProjects, getPersonalInfo } from '@/lib/database/db'
import type { Tenant } from '@/middleware'

export const metadata: Metadata = {
  title: 'Projects & Case Studies | Brian Thomas',
  description: 'Technical implementations and architectural wins.',
}

export default async function CaseStudies() {
  const headersList = await headers()
  const tenant = (headersList.get('x-tenant') || 'internal') as Tenant
  const [projects, personalInfo] = await Promise.all([
    getProjects(tenant).catch(() => []),
    getPersonalInfo(tenant).catch(() => null),
  ])

  return <ProjectsPage initialProjects={projects} contactEmail={personalInfo?.email} />
}
