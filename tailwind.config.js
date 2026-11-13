/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'nexus-blue': '#0ea5e9',
        'nexus-purple': '#8b5cf6',
        'nexus-green': '#10b981',
        'nexus-red': '#ef4444',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'nexus-blue': '0 0 20px rgba(14, 165, 233, 0.3)',
        'nexus-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'nexus-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'nexus-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow': '0 0 15px rgba(14, 165, 233, 0.4)',
      },
    },
  },
  plugins: [],
}
