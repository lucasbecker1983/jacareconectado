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
        google: {
          blue: '#1a73e8',
          gray: '#f1f3f4',
          dark: '#202124',
          surface: '#ffffff',
          darkSurface: '#303134',
        }
      }
    },
  },
  plugins: [],
}
