import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6eef5',
          100: '#ccdde9',
          200: '#99bbd4',
          300: '#6699be',
          400: '#3377a9',
          500: '#00356B',  // Your brand blue
          600: '#002a56',
          700: '#002040',
          800: '#00152b',
          900: '#000b15',
        },
        secondary: {
          50: '#fdebee',
          100: '#fad2d9',
          200: '#f4a6b7',
          300: '#ee7a95',
          400: '#e84e73',
          500: '#A51C30',  // Your brand red
          600: '#841626',
          700: '#63111d',
          800: '#420b13',
          900: '#21060a',
        },
        brand: {
          blue: {
            50: '#e6eef5',
            100: '#ccdde9',
            200: '#99bbd4',
            300: '#6699be',
            400: '#3377a9',
            500: '#00356B',  // Your brand blue
            600: '#002a56',
            700: '#002040',
            800: '#00152b',
            900: '#000b15',
          },
          red: {
            50: '#fce8eb',
            100: '#f9d1d7',
            200: '#f3a3af',
            300: '#ed7587',
            400: '#e7475f',
            500: '#A51C30',  // Your brand red
            600: '#841626',
            700: '#63111d',
            800: '#420b13',
            900: '#21060a',
          }
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        background: {
          100: '#fafcfd',
          200: '#e8f1f6',
          300: '#d6e6ee',
        },
        text: {
          100: '#010d17',
          200: '#032948',
          300: '#054479',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 53, 107, 0.3)',
        'glow': '0 0 20px rgba(0, 53, 107, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 53, 107, 0.5)',
        'accent-glow': '0 0 20px rgba(165, 28, 48, 0.4)',
        'success-glow': '0 0 20px rgba(16, 185, 129, 0.4)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-smooth': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};

export default config;

