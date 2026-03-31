import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F5F2ED',
        surface: '#FDFAF6',
        'surface-2': '#EDE9E2',
        ink: '#1A1714',
        'ink-2': '#6B6560',
        'ink-3': '#A09A93',
        accent: '#C84B2F',
        green: '#2A6B4A',
        'green-bg': '#EBF4EE',
        amber: '#B5730A',
        'amber-bg': '#FEF3DC',
        'red-bg': '#FDECEA',
        blue: '#185FA5',
        'blue-bg': '#E6F1FB',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
}
export default config
