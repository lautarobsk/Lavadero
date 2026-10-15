/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        francia: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          400: '#3b82f6',
          500: '#1d4ed8',
          600: '#0055d4', // Auténtico Azul Francia
          700: '#0043ab',
          800: '#003387',
          900: '#002666',
        },
        rojo: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
        }
      }
    },
  },
  plugins: [],
}
