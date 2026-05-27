/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ds19-navy': '#1d4ed8',
        'ds19-blue': '#2563eb',
        'ds19-teal': '#0d9488',
        'ds19-green': '#059669',
        'ds19-lightblue': '#dbeafe',
      },
    },
  },
  plugins: [],
};