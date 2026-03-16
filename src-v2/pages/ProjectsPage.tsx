'use client'

import { useState, useCallback } from 'react'
import type { Project } from '@/lib/database/types'
import Navbar from '@v2/components/layout/Navbar'
import ProjectGrid from '@v2/components/projects/ProjectGrid'
import Footer from '@v2/components/layout/Footer'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

interface ProjectsPageProps {
  initialProjects: Project[]
}

export default function ProjectsPage({ initialProjects }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        setProjects(await res.json())
      }
    } catch {
      // keep existing data on fetch failure
    }
  }, [])

  // Real-time updates
  useRealtimeUpdates((message) => {
    if (message.type === 'content-update' && message.data?.contentType === 'Projects') {
      fetchProjects()
    }
  })

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <Navbar />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="font-space text-xs tracking-[2px] uppercase mb-2"
            style={{ color: 'var(--accretion)' }}
          >
            Portfolio
          </div>
          <h1
            className="font-space text-2xl md:text-3xl font-bold mb-8"
            style={{ color: 'var(--floral)' }}
          >
            Projects & Case Studies
          </h1>

          {projects.length === 0 ? (
            <div style={{ color: 'rgba(245,222,179,0.3)' }} className="text-sm">
              No projects yet.
            </div>
          ) : (
            <ProjectGrid projects={projects} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
