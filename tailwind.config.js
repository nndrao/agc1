/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        light: 'var(--background)',
        dark: 'var(--background)',
      },
      textColor: {
        light: 'var(--text)',
        dark: 'var(--text)',
      },
    },
  },
  plugins: [],
}