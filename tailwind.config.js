/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        primary: {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC107', // amber
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#FF6F00',
        },
        secondary: {
          50: '#EFEBE9',
          100: '#D7CCC8',
          200: '#BCAAA4',
          300: '#A1887F',
          400: '#8D6E63',
          500: '#795548', // terracotta
          600: '#6D4C41',
          700: '#5D4037',
          800: '#4E342E',
          900: '#3E2723',
        },
        accent: {
          50: '#F1F8E9',
          100: '#DCEDC8',
          200: '#C5E1A5',
          300: '#AED581',
          400: '#9CCC65',
          500: '#8BC34A', // olive green
          600: '#7CB342',
          700: '#689F38',
          800: '#558B2F',
          900: '#33691E',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        success: {
          500: '#4CAF50',
        },
        warning: {
          500: '#FF9800',
        },
        error: {
          500: '#F44336',
        }
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}