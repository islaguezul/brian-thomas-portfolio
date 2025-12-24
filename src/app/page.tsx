import ResumeHomepage from '@/components/ResumeHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brian Thomas | Technical Program Manager',
  description: 'Senior Technical Program Manager bridging the gap between complex engineering and product delivery. Shipping at scale since 2011.',
}

export default function Home() {
  return <ResumeHomepage />
}