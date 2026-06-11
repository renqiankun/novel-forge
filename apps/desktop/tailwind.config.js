/** @type {import('tailwindcss').Config} */
const spacing = {
  0: '0px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  4.5: '18px',
  5: '20px',
  5.5: '22px',
  6: '24px',
  6.5: '26px',
  7: '28px',
  7.5: '30px',
  8: '32px',
  8.5: '34px',
  9: '36px',
  9.5: '38px',
  10: '40px',
}

const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
}

const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
}

const maxWidth = {
  container: '1920px',
}

const colors = {
  ink: '#1b2430',
  copper: '#a95d2d',
  moss: '#47745d',
  signal: '#2f6fed',
  warning: '#c07b2a',
}

module.exports = {
  content: ['./index.html', './renderer/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing,
      fontSize,
      borderRadius,
      maxWidth,
      colors,
    },
  },
  plugins: [],
}
