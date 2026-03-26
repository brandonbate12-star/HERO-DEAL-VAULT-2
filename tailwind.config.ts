import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hero: {
          purple: '#7C3AED',
          'purple-light': '#A78BFA',
          'purple-dark': '#5B21B6',
          dark: '#0F0A1A',
          'dark-light': '#1A1128',
          'dark-card': '#231A33',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 33, 182, 0.05) 100%)',
      },
    },
  },
  plugins: [],
}
export default config
