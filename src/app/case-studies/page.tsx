import CaseStudiesPage from '@/components/CaseStudiesPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies | Brian Thomas',
  description: 'Technical implementations and architectural wins. Explore projects showcasing modern web architecture, AI integration, and enterprise solutions.',
}

export default function CaseStudies() {
  return <CaseStudiesPage />
}
