/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f0f',
        card: '#1a1a1a',
        border: '#2a2a2a',
        primary: '#7c3aed',
        'primary-light': '#a78bfa',
        muted: '#71717a',
      },
    },
  },
};
