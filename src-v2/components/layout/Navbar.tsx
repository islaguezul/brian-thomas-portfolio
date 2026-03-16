'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavbarProps {
  contactEmail?: string
}

export default function Navbar({ contactEmail }: NavbarProps) {
  const [isOpaque, setIsOpaque] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Switch to opaque after scrolling past the video section (~350vh on desktop, ~250vh on mobile)
      const videoSectionHeight = window.innerWidth < 768
        ? window.innerHeight * 2.5
        : window.innerHeight * 3.5
      setIsOpaque(window.scrollY > videoSectionHeight * 0.85)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/case-studies', label: 'Projects' },
  ]

  const contactHref = contactEmail ? `mailto:${contactEmail}` : '#'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 glass-nav ${isOpaque ? 'glass-nav--opaque' : ''}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Name */}
        <Link
          href="/"
          className="font-space text-sm font-semibold tracking-wide"
          style={{ color: 'var(--floral)' }}
        >
          Brian Thomas
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: 'rgba(245, 222, 179, 0.5)' }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={contactHref}
            className="text-xs px-4 py-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(46, 196, 182, 0.15)',
              color: 'var(--deep-teal)',
              border: '1px solid rgba(46, 196, 182, 0.25)',
            }}
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-0.5 rounded transition-transform"
            style={{
              background: 'var(--accretion)',
              transform: isMobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
            }}
          />
          <span
            className="block w-5 h-0.5 rounded transition-opacity"
            style={{
              background: 'var(--accretion)',
              opacity: isMobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-0.5 rounded transition-transform"
            style={{
              background: 'var(--accretion)',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden px-6 pb-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid rgba(212, 168, 85, 0.08)' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm py-1"
              style={{ color: 'rgba(245, 222, 179, 0.6)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={contactHref}
            className="text-sm py-1"
            style={{ color: 'var(--deep-teal)' }}
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  )
}
