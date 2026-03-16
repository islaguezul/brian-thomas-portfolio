import HomePage from '@v2/pages/HomePage'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPersonalInfo, getProjects } from '@/lib/database/db'
import type { Tenant } from '@/middleware'

export const metadata: Metadata = {
  title: 'Brian Thomas | Technical Product Manager',
  description: 'Technical Product Manager with 10+ years transforming complex technical challenges into scalable business solutions.',
}

export default async function Home() {
  const headersList = await headers()
  const tenant = (headersList.get('x-tenant') || 'internal') as Tenant

  // Direct database calls — no self-fetch anti-pattern
  const [personalInfo, projects] = await Promise.all([
    getPersonalInfo(tenant).catch(() => null),
    getProjects(tenant).catch(() => []),
  ])

  const fallbackInfo = {
    name: 'Brian Thomas',
    title: 'Technical Product Manager',
    email: '',
  }

  return (
    <HomePage
      personalInfo={personalInfo ?? fallbackInfo}
      projectCount={projects.length}
    />
  )
}
