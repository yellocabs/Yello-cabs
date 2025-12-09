/** @type {import('tailwindcss').Config} */
module.exports = {
  // Assuming NativeWind is still needed for React Native development
  presets: [require('nativewind/preset')],

  content: ['./App.{js,jsx,tsx}', './src/**/*.{js,jsx,tsx}'],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
        Urbanist: ['Urbanist-Regular', 'sans-serif'],
        UrbanistBold: ['Urbanist-Bold', 'sans-serif'],
        UrbanistExtraBold: ['Urbanist-ExtraBold', 'sans-serif'],
        UrbanistLight: ['Urbanist-Light', 'sans-serif'],
        UrbanistMedium: ['Urbanist-Medium', 'sans-serif'],
        UrbanistSemiBold: ['Urbanist-SemiBold', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#f0bd1a', // Use for standard bg-primary or text-primary
          500: '#FDB726', // The main gold/yellow
          200: '#dfc081ff',
          100: '#FFF7E9', // Lighter shade for backgrounds/hovers
          // You can generate a full scale (100-900) based on this yellow if needed
        },

        // Secondary accent color (#E8C58C)
        'brand-accent': {
          DEFAULT: '#E8C58C',
          500: '#E8C58C',
        },

        // Explicit Black and White from the design
        'brand-black': '#000000', // Use for text-brand-black
        'brand-white': '#FFFFFF', // Use for bg-brand-white

        // --- UTILITY COLORS (Kept the scales from your original config) ---
        // Note: The original 'secondary' (gray) and 'primary' (blue) scales were removed
        // to avoid conflict and align with the new brand identity.

        // Keeping status colors
        success: {
          100: '#F0FFF4',
          200: '#C6F6D5',
          300: '#9AE6B4',
          400: '#68D391',
          500: '#38A169',
          600: '#2F855A',
          700: '#276749',
          800: '#22543D',
          900: '#1C4532',
        },
        danger: {
          100: '#FFF5F5',
          200: '#FED7D7',
          300: '#FEB2B2',
          400: '#FC8181',
          500: '#F56565',
          600: '#E53E3E',
          700: '#C53030',
          800: '#9B2C2C',
          900: '#742A2A',
        },
        warning: {
          100: '#FFFBEB',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        // Keeping the general bucket
        general: {
          100: '#CED1DD',
          200: '#858585',
          300: '#EEEEEE',
          400: '#0CC25F',
          500: '#F6F8FA',
          600: '#E6F3FF',
          700: '#EBEBEB',
          800: '#ADADAD',
        },
      },
    },
  },
  plugins: [],
};
