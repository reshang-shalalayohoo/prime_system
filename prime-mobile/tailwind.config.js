/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a',
          dark: '#15803d',
          light: '#22c55e',
          bg: '#f0fdf4',
        },
        admin: {
          DEFAULT: '#0f172a',
          accent: '#0284c7',
        },
      },
    },
  },
  plugins: [],
}
