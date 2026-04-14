/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Переопределяем весь blue → тиловая палитра #74AA9C
        // На bg blue-600 (#5d9088) — white текст: контраст 3.6:1 (OK для крупного bold)
        // На bg white — text-blue-700 (#4a7a70): контраст ~5.5:1 ✓ WCAG AA
        blue: {
          50:  '#f0f7f5',
          100: '#d9eeea',
          200: '#b3ddd6',
          300: '#8ecbc2',
          400: '#74AA9C',
          500: '#74AA9C',
          600: '#5d9088',
          700: '#4a7a70',
          800: '#3a6058',
          900: '#2a4842',
          950: '#1a2e2a',
        },
      },
    },
  },
  plugins: [],
};
