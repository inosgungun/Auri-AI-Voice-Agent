import { type Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        light: '#1e1e1e',
        primary: '#007aff',
        accent: '#facc15',
        border: '#2d2d2d',
        hoverBg: '#2a2a2a',
        cardBg: '#1c1c1e',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
}

export default config
