interface HeroOverlayProps {
  name: string
  title: string
  style?: React.CSSProperties
}

export default function HeroOverlay({ name, title, style }: HeroOverlayProps) {
  return (
    <div
      className="pointer-events-none flex flex-col items-center justify-center"
      style={style}
    >
      <div className="text-center" style={{ textShadow: 'none' }}>
        <div
          className="font-space text-base md:text-lg font-bold tracking-[4px] uppercase mb-3"
          style={{
            color: '#000',
            WebkitTextStroke: '0.5px rgba(212, 168, 85, 0.5)',
          }}
        >
          {title}
        </div>
        <h1
          className="font-space text-5xl md:text-7xl lg:text-8xl font-bold"
          style={{ color: '#000', WebkitTextStroke: '1px rgba(212, 168, 85, 0.4)' }}
        >
          {name}
        </h1>
      </div>
    </div>
  )
}
