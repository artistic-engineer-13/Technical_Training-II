/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2fbf4',
          100: '#e2f6e7',
          200: '#c5eccf',
          500: '#2e7d32', // Custom Zomato/Blinkit Green
          600: '#256428',
          700: '#1b4b1e',
        },
        gray: {
          150: '#e5e7eb',
          250: '#d1d5db',
          850: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}
