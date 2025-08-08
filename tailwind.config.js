/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'buildly': {
          primary: '#2563EB',    // Primary blue
          secondary: '#1E40AF',  // Darker blue
          accent: '#10B981',     // Green accent
          dark: '#1F2937',       // Dark text/backgrounds
          light: '#F3F4F6',      // Light backgrounds
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
