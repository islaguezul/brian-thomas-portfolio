'use client'

import React from 'react'
import { Users, DollarSign, Clock } from 'lucide-react'
import TechTicker from './TechTicker'
import ImpactTimeline from './ImpactTimeline'
import Navigation from './Navigation'
import ParticleBackground from './ParticleBackground'

const ResumeHomepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <ParticleBackground />

      {/* Navigation - hidden in print */}
      <div className="print:hidden">
        <Navigation currentSection="home" onSectionChange={() => {}} />
      </div>

      {/* Hero Section - hidden in print */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="space-y-6">
            {/* Subhead */}
            <p className="text-blue-400 font-semibold text-lg tracking-wide uppercase">
              Technical Program Manager
            </p>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Bridging the gap between complex engineering and product delivery.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Shipping at scale since 2011.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/30 transition-all duration-500 hover-lift">
              <div className="flex items-center justify-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                <span className="text-3xl font-bold text-green-400">$2M+</span>
              </div>
              <p className="text-slate-400 text-sm">Budget Managed</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500 hover-lift">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-400" />
                <span className="text-3xl font-bold text-blue-400">15+</span>
              </div>
              <p className="text-slate-400 text-sm">Teams Aligned</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-500 hover-lift">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-purple-400" />
                <span className="text-3xl font-bold text-purple-400">99.9%</span>
              </div>
              <p className="text-slate-400 text-sm">Uptime Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Ticker - hidden in print */}
      <div className="py-8 print:hidden">
        <TechTicker speed="normal" />
      </div>

      {/* Timeline Section - this will be printed */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header - visible in both screen and print */}
          <div className="text-center mb-16 print:mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 print:text-2xl print:text-black">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent print:bg-none print:text-black">
                Experience & Impact
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto print:text-gray-600 print:text-base">
              A track record of delivering complex programs across aerospace, utilities, and technology sectors.
            </p>
          </div>

          {/* Impact Timeline */}
          <ImpactTimeline />
        </div>
      </section>

      {/* Footer - hidden in print */}
      <footer className="bg-gradient-to-b from-slate-900/80 to-slate-950 border-t border-slate-700/50 backdrop-blur-xl print:hidden">
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

export default ResumeHomepage
