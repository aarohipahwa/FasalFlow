/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#17324D', light: '#2F5D7C' },
        agri: { green: '#4F7D5A', sage: '#DCE9DF' },
        saffron: { DEFAULT: '#D99A3D', light: '#FBF3E4' },
        warm: '#F7F8F5',
        line: '#D9E0E3',
        ink: { DEFAULT: '#26343D', secondary: '#65747D' },
        success: { DEFAULT: '#3F7D58', light: '#DCE9DF' },
        warning: { DEFAULT: '#C58A32', light: '#FBF3E4' },
        danger: { DEFAULT: '#B85C5C', light: '#F5E8E8' },
      },
    },
  },
  plugins: [],
};
