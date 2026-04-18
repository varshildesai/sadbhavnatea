/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ffa94d', // very light orange
          DEFAULT: '#e67300', // vibrant deep orange (matching top packaging) 
          dark: '#b35900'   // darker orange
        },
        secondary: {
          light: '#2d9c5a', // light leaf green
          DEFAULT: '#007a33', // intense dark green (bottom packaging) 
          dark: '#005222'   // darker green
        },
        surface: {
          light: '#ffffff', // white
          DEFAULT: '#fdfbf7', // warm off-white, tea-like
          dark: '#f0ece1'   // slightly darker earthy grey
        }
      }
    },
  },
  plugins: [],
}
