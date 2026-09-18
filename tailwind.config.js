/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF9F6', // Primary canvas background
          100: '#F5F3EC',
          200: '#EBE7DE',
          300: '#DED7C8',
          400: '#C7BDAB',
          500: '#9C907C',
        },
        islamic: {
          50: '#F2F6F4',
          100: '#E2ECE8',
          200: '#C2D7CE',
          600: '#2A5C4E',
          700: '#204C40',
          800: '#173C32', // Primary dark green
          900: '#0E2620',
          950: '#081713',
        },
        night: {
          950: '#06120E', // Deepest background in dark mode
          900: '#0B1D17', // Canvas background
          850: '#0F261F', // Card background in dark mode
          800: '#15332B', // Hover/elevated surfaces
          700: '#1E453B',
          border: '#1B3830', // Subtle border in dark mode
          text: '#ECE7DE',
          muted: '#92A69F',
        },
        gold: {
          50: '#FAF7F0',
          100: '#F3EDE0',
          200: '#E4D5BC',
          300: '#D2BC94',
          400: '#C5A880', // Subtle warm gold accent
          500: '#B38E46',
          600: '#947230',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'Noto Naskh Arabic', 'serif'],
        quran: ['Amiri Quran', 'Amiri', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Cinzel', 'serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(23, 60, 50, 0.04)',
        'card': '0 4px 20px -2px rgba(23, 60, 50, 0.05)',
        'card-hover': '0 10px 25px -4px rgba(23, 60, 50, 0.08)',
        'counter': '0 0 25px rgba(197, 168, 128, 0.25)',
      },
    },
  },
  plugins: [],
}
