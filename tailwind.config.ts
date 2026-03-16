import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src-v2/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        void: '#02040a',
        'warm-black': '#0d0a06',
        'deep-amber': '#1a1008',
        'dark-gold': '#8b6914',
        'accretion': '#d4a855',
        'wheat-light': '#f5deb3',
        'floral': '#fffaf0',
        'deep-teal': '#2ec4b6',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-rotate': 'border-rotate 8s linear infinite',
      },
      keyframes: {
        'border-rotate': {
          to: { '--angle': '495deg' },
        },
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config