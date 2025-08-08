/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        'buildly': {
          primary: '#2563EB', // Adjust this to match Buildly's blue
          secondary: '#1E40AF', // Darker blue
          accent: '#10B981', // Green accent
          dark: '#1F2937',
          light: '#F3F4F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
