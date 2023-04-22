const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    /*These colors are taken from FreeCodeCamp's design guide
      refer to https://design-style-guide.freecodecamp.org/ to have a clear understanding*/
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      fcc: {
        gray: {
          /*It's supposed to be 00 instead of 0o0 but
            due to an error with writting 00, "Octal numbers are not allowed. Use the syntax '0o0'" */
          //LIGHT GRAYs
          0o0: '#ffffff',
          0o5: '#f5f6f7',
          10: '#dfdfe2',
          15: '#d0d0d5',
          // DARK GRAYs
          75: '#3b3b4f',
          80: '#2a2a40',
          85: '#1b1b32',
          90: '#0a0a23'
        },

        primary: {
          purple: '#dbb8ff',
          yellow: '#f1be32',
          blue: '#99c9ff',
          lightGreen: '#acd157'
        },

        secondary: {
          darkPurple: '#5a01a7',
          darkYellow: '#4d3800',
          darkBlue: '#002ead',
          darkGreen: '#00471b'
        }
      },
      ...colors
    }
  },
  extend: {
    colors: {
      'gray-90': '#0a0a23'
    }
  },
  plugins: []
};
