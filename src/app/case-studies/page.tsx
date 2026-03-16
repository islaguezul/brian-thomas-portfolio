import ProjectsPage from '@v2/pages/ProjectsPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects & Case Studies | Brian Thomas',
  description: 'Technical implementations and architectural wins.',
}

export default function CaseStudies() {
  return <ProjectsPage />
}
