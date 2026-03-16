import ProjectsPage from '@v2/pages/ProjectsPage'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getProjects } from '@/lib/database/db'
import type { Tenant } from '@/middleware'

export const metadata: Metadata = {
  title: 'Projects & Case Studies | Brian Thomas',
  description: 'Technical implementations and architectural wins.',
}

export default async function CaseStudies() {
  const headersList = await headers()
  const tenant = (headersList.get('x-tenant') || 'internal') as Tenant
  const projects = await getProjects(tenant).catch(() => [])

  return <ProjectsPage initialProjects={projects} />
}
