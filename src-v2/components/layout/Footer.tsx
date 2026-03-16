interface FooterProps {
  name?: string
}

export default function Footer({ name = 'Brian Thomas' }: FooterProps) {
  return (
    <footer
      className="py-8 px-6 text-center"
      style={{
        borderTop: '1px solid rgba(212, 168, 85, 0.08)',
        color: 'rgba(245, 222, 179, 0.25)',
      }}
    >
      <div className="text-xs">
        © {new Date().getFullYear()} {name}
      </div>
    </footer>
  )
}
