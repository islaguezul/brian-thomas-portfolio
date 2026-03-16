interface HeroOverlayProps {
  name: string
  title: string
  style?: React.CSSProperties
}

export default function HeroOverlay({ name, title, style }: HeroOverlayProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center"
      style={{ mixBlendMode: 'screen', ...style }}
    >
      <div
        className="text-center"
        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
      >
        <div
          className="font-space text-xs tracking-[3px] uppercase mb-2"
          style={{ color: 'var(--accretion)' }}
        >
          {title}
        </div>
        <h1
          className="font-space text-4xl md:text-6xl font-bold mb-4"
          style={{ color: 'var(--floral)' }}
        >
          {name}
        </h1>
        <div
          className="text-xs tracking-wide animate-pulse"
          style={{ color: 'rgba(245, 222, 179, 0.4)' }}
        >
          Scroll to explore
        </div>
      </div>
    </div>
  )
}
