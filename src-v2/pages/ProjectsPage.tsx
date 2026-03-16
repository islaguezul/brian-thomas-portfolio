'use client'

import { useState, useEffect } from 'react'
import type { Project } from '@/lib/database/types'
import Navbar from '@v2/components/layout/Navbar'
import ProjectGrid from '@v2/components/projects/ProjectGrid'
import Footer from '@v2/components/layout/Footer'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        setProjects(await res.json())
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
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

          {isLoading ? (
            <div style={{ color: 'rgba(245,222,179,0.3)' }} className="text-sm">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
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
