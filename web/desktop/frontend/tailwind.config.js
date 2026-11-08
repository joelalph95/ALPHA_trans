/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#060a0f',
        'bg-card': '#0d1520',
        'bg-hover': '#111d2e',
        'border': '#1a2d45',
        'border-light': '#22395a',
        'accent-primary': '#00d4ff',
        'accent-secondary': '#0066ff',
        'accent-green': '#00e5a0',
        'accent-orange': '#ff6b35',
        'accent-red': '#ff3b5c',
        'text-primary': '#e8f4fd',
        'text-secondary': '#7aa3c8',
        'text-muted': '#3d6080',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

