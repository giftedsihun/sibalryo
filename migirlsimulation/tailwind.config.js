/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'haru': {
          DEFAULT: '#FF6B9D',
          light: '#FFB3CE',
          dark: '#D94F80'
        },
        'sejin': {
          DEFAULT: '#4ECDC4',
          light: '#A7EDE8',
          dark: '#2BA89F'
        },
        'daeun': {
          DEFAULT: '#A78BFA',
          light: '#DDD6FE',
          dark: '#7C3AED'
        },
        'navy': {
          900: '#0A0E1A',
          800: '#111827',
          700: '#1F2937',
          600: '#374151'
        }
      },
      fontFamily: {
        'korean': ['"Noto Sans KR"', 'sans-serif'],
        'display': ['"Black Han Sans"', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'typewriter': 'typewriter 0.05s steps(1) infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }
      },
      backdropBlur: { xs: '2px' },
      backgroundSize: { '200%': '200%' }
    }
  },
  plugins: []
}
