interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow */}
      <div className="glass-outer-glow" />

      {/* Animated border */}
      <div className="glass-border" />

      {/* Glass surface */}
      <div className="glass-card">
        {/* Specular highlight */}
        <div className="glass-highlight" />

        {/* Inner glow */}
        <div className="glass-glow" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
