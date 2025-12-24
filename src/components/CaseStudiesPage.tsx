'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import Navigation from './Navigation'
import ParticleBackground from './ParticleBackground'
import ProjectList from './ProjectList'
import type { Project as DBProject } from '@/lib/database/types'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

const CaseStudiesPage: React.FC = () => {
  const [dbProjects, setDbProjects] = useState<DBProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useRealtimeUpdates((message) => {
    if (message.type === 'content-update') {
      if (message.data?.contentType === 'Projects') {
        fetchProjects()
      }
    }
  })

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const fetchedProjects = await response.json()
        setDbProjects(fetchedProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Hardcoded projects (fallback/supplemental)
  const hardcodedProjects: Array<{
    id: string
    name: string
    status: string
    description: string
    tech: string[]
    stage: string
    progress: number
    impact: Record<string, string>
    features: string[]
    experimental: boolean
    legacy?: boolean
  }> = [
    {
      id: 'crypto-bot',
      name: 'Crypto Trading Bot',
      status: 'Active Development',
      description: 'AI-powered cryptocurrency trading system with sentiment analysis, technical indicators, and risk management.',
      tech: ['Python', 'TensorFlow', 'Pandas', 'WebSocket', 'REST APIs', 'PostgreSQL', 'Docker', 'AWS'],
      stage: 'mvp',
      progress: 75,
      impact: { 'roi': '23%', 'trades': '1,247', 'accuracy': '68%' },
      features: ['Real-time market data processing', 'Machine learning price prediction', 'Automated risk management'],
      experimental: true
    },
    {
      id: 'konnosaur',
      name: 'Konnosaur Social Platform',
      status: 'Backend Complete',
      description: 'Next-generation social media platform with microservices architecture and real-time messaging.',
      tech: ['Node.js', 'GraphQL', 'MongoDB', 'Redis', 'Docker', 'AWS'],
      stage: 'backend',
      progress: 70,
      impact: { microservices: '8 Services', apis: '40+ Endpoints', documentation: '95% Coverage' },
      features: ['Microservices architecture', 'Real-time messaging', 'Content moderation AI'],
      experimental: false
    },
    {
      id: 'portfolio-site',
      name: 'This Portfolio Site',
      status: 'Production',
      description: 'Self-referential demonstration of modern web architecture and technical product management methodology.',
      tech: ['React', 'Next.js', 'Three.js', 'Recharts', 'Tailwind CSS', 'Vercel'],
      stage: 'production',
      progress: 95,
      impact: { performance: '98/100', accessibility: '96/100', innovation: 'High' },
      features: ['Live data integration', 'Responsive design', 'Performance optimization'],
      experimental: false
    },
    {
      id: 'knowledge-management',
      name: 'Enterprise Process Knowledge System',
      status: 'Legacy Project',
      description: 'SharePoint-based knowledge management platform connecting employees to role-specific training within two clicks.',
      tech: ['SharePoint', 'HTML/CSS', 'JavaScript', 'SQL Server', 'Custom SVG Graphics', 'D3.js'],
      stage: 'legacy',
      progress: 100,
      impact: { 'adoption': '2,500+ Users', 'efficiency': '40% Task Time Reduction', 'training': '85% Self-Service Rate' },
      features: ['Custom-built SVG process modeling', 'Role-based content delivery', 'Two-click navigation'],
      experimental: false,
      legacy: true
    }
  ]

  // Transform DB projects
  const transformedDbProjects = dbProjects
    .filter(project => project.screenshots && project.screenshots.length > 0)
    .map(project => ({
      id: project.id?.toString() || 'unknown',
      name: project.name,
      status: project.status || 'Unknown',
      description: project.description || '',
      tech: project.technologies || [],
      stage: project.stage,
      progress: project.progress || 0,
      impact: project.impacts?.reduce((acc, impact) => {
        if (impact.metricKey && impact.metricValue &&
            impact.metricValue !== 'undefined' && impact.metricValue !== 'null') {
          acc[impact.metricKey] = impact.metricValue
        }
        return acc
      }, {} as Record<string, string>) || {},
      features: project.features?.map(f => f.feature) || [],
      experimental: project.experimental || false,
      legacy: project.legacy || false
    }))

  // Merge projects
  const mergedProjects = [...hardcodedProjects]
  transformedDbProjects.forEach(dbProject => {
    const existingIndex = mergedProjects.findIndex(p => p.name === dbProject.name)
    if (existingIndex >= 0) {
      mergedProjects[existingIndex] = dbProject
    } else {
      mergedProjects.push(dbProject)
    }
  })

  const activeProjects = mergedProjects.filter(p => !p.legacy)
  const legacyProjects = mergedProjects.filter(p => p.legacy)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ParticleBackground />

      {/* Semi-transparent gradient overlay - allows starscape to show through */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-blue-900/50 to-slate-800/70 pointer-events-none" />

      {/* Navigation */}
      <Navigation currentSection="case-studies" onSectionChange={() => {}} />

      {/* Page Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Case Studies
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Technical implementations and architectural wins.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-slate-400">Loading projects...</span>
            </div>
          ) : (
            <>
              {/* Active Projects */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Active Projects
                  </span>
                </h2>
                <ProjectList projects={activeProjects} />
              </div>

              {/* Legacy Projects */}
              {legacyProjects.length > 0 && (
                <div className="mt-20">
                  <h2 className="text-2xl font-bold mb-8 text-center">
                    <span className="bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent">
                      Historical Projects
                    </span>
                  </h2>
                  <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">
                    Enterprise-scale solutions from previous roles demonstrating deep technical expertise.
                  </p>
                  <ProjectList projects={legacyProjects} />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900/80 to-slate-950 border-t border-slate-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h5 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Brian Thomas
            </h5>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Technical Program Manager | AI Enthusiast | Process Innovator
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Brian Thomas. Crafted with React, Next.js, and a passion for exceptional product experiences.
            </p>
            <div className="mt-2">
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-2 h-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300"
                aria-label="Admin"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CaseStudiesPage
