/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // VenceJá Design System - HSL colors
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(222.2, 84%, 4.9%)',

        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222.2, 84%, 4.9%)',
        },

        popover: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222.2, 84%, 4.9%)',
        },

        // VenceJá Primary Green (#4CAF50)
        primary: {
          DEFAULT: 'hsl(122, 39%, 49%)',
          foreground: 'hsl(0, 0%, 100%)',
        },

        // VenceJá Secondary - Neutral Slate
        secondary: {
          DEFAULT: 'hsl(215, 16%, 47%)',
          foreground: 'hsl(0, 0%, 100%)',
        },

        muted: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(215.4, 16.3%, 46.9%)',
        },

        accent: {
          DEFAULT: 'hsl(215, 20%, 65%)',
          foreground: 'hsl(215, 25%, 15%)',
        },

        destructive: {
          DEFAULT: 'hsl(0, 84.2%, 60.2%)',
          foreground: 'hsl(210, 40%, 98%)',
        },

        // Status colors for boletos
        success: 'hsl(122, 39%, 49%)',
        warning: 'hsl(25, 95%, 53%)',
        danger: 'hsl(0, 84.2%, 60.2%)',

        border: 'hsl(214.3, 31.8%, 91.4%)',
        input: 'hsl(214.3, 31.8%, 91.4%)',
        ring: 'hsl(122, 39%, 49%)',

        // Legacy status colors (for backward compatibility)
        'status-pendente': 'hsl(25, 95%, 53%)',
        'status-vencido': 'hsl(0, 84.2%, 60.2%)',
        'status-pago': 'hsl(122, 39%, 49%)',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
};

