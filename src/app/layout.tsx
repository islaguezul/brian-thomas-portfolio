import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brian Thomas - Technical Product Manager',
  description: 'Technical Product Manager with 10+ years of experience transforming complex technical challenges into scalable business solutions. Expert in AI integration, process improvement, and enterprise architecture.',
  keywords: 'Technical Product Manager, AI Integration, Process Management, Full-Stack Architecture, BPMN 2.0, Blue Origin, Software Development',
  authors: [{ name: 'Brian Thomas' }],
  creator: 'Brian Thomas',
  openGraph: {
    title: 'Brian Thomas - Technical Product Manager',
    description: 'Transforming complex technical challenges into scalable business solutions through systematic product development and AI integration.',
    url: 'https://brianthomas.dev', // Update with your actual domain
    siteName: 'Brian Thomas Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brian Thomas - Technical Product Manager',
    description: 'Technical Product Manager specializing in AI integration and enterprise architecture',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}