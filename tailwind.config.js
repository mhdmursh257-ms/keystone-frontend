/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          900: '#0a192f',
        }
      }
    },
  },
  plugins: [],
};