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
        primary: '#4CAF50',
        'status-pendente': '#FF9800',
        'status-vencido': '#F44336',
        'status-pago': '#4CAF50',
      },
    },
  },
  plugins: [],
};

