/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a1322',
        surface: '#17202f',
        cyan: '#00e5ff',
        purple: '#571bc1',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
        label: ['Geist', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0,229,255,0.3), inset 0 0 10px rgba(0,229,255,0.1)',
      },
    },
  },
  plugins: [],
}
