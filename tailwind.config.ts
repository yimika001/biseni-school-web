import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#00A86B',
          DEFAULT: '#008751', // Nigerian Green
          dark: '#005F39',
        },
        accent: {
          DEFAULT: '#D4AF37', // Gold
          hover: '#B8962E',
        },
      },
    },
  },
  plugins: [],
} satisfies Config