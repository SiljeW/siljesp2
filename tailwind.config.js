/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}", 
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#766EB2', // Light purple 
          DEFAULT: '#32193D', // Dark purple
          dark: '#111827',  // Dark blue
        },
        secondary: {
          DEFAULT: '#B95539', // Red/orange
        },
      },
    },
  },
  plugins: [],
}