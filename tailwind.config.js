/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // هذا السطر مهم جداً
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}