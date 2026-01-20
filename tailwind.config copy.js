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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#7EC8A0',
          600: '#16a34a',
          700: '#15803d',
        },
        secondary: {
          400: '#5B8A9C',
          500: '#3F5E6B',
          600: '#2E4A54',
          700: '#1E3238',
        },
        accent: {
          blue: '#4A7C8C',
          lightBlue: '#E8F4F8',
          teal: '#3D6B7D',
        }
      },
    },
  },
  plugins: [],
}
