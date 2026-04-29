/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para que se vea más pro
        primary: '#1e40af', 
        secondary: '#0f172a',
      }
    },
  },
  plugins: [],
}