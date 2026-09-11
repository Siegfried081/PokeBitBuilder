/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        led: {
          off: "#12141a",
          grid: "#0b0c10",
        }
      }
    },
  },
  plugins: [],
}
