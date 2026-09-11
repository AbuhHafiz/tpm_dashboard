/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tonasa: {
          blue: '#0b2e59',
          dark: '#071e3b',
          navy: '#051830',
          yellow: '#f4b000',
          gold: '#e09900',
          red: '#d92525'
        }
      }
    },
  },
  plugins: [],
}