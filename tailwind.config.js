/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'almost-black': '#101010', // This is an example of a color that's nearly black
      }
    },
  },
  plugins: [],
}

