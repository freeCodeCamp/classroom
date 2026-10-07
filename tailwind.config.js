const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

/*
  Without these, we get warnings in our console regarding these colors being deprecated.
  Changes were implemented based on this GitHub discussion: https://github.com/tailwindlabs/tailwindcss/issues/4690 */
delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['coolGray'];
delete colors['trueGray'];
delete colors['blueGray'];

/*
  The palette comes from @freecodecamp/ui. Its base.css defines the raw color
  variables (--gray90, --yellow45, ...) on :root and the semantic ones
  (--foreground-primary, --background-secondary, ...) on .light-palette /
  .dark-palette. The `extend` block below mirrors the library's own Tailwind
  config (https://github.com/freeCodeCamp/ui/blob/main/tailwind.config.js)
  so Classroom's utility classes use the same names as freeCodeCamp.
*/
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  corePlugins: {
    // @freecodecamp/ui/dist/base.css already ships Tailwind's preflight.
    preflight: false
  },
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ...colors,
      // Legacy Classroom aliases, kept until every usage is migrated.
      fcc: {
        gray: {
          /*It's supposed to be 00 instead of 0o0 but
            due to an error with writting 00, "Octal numbers are not allowed. Use the syntax '0o0'" */
          0o0: 'var(--gray00)',
          0o5: 'var(--gray05)',
          10: 'var(--gray10)',
          15: 'var(--gray15)',
          45: 'var(--gray45)',
          75: 'var(--gray75)',
          80: 'var(--gray80)',
          85: 'var(--gray85)',
          90: 'var(--gray90)'
        },
        primary: {
          purple: 'var(--purple10)',
          yellow: 'var(--yellow45)',
          blue: 'var(--blue30)',
          lightGreen: 'var(--green40)'
        },
        secondary: {
          darkPurple: 'var(--purple90)',
          darkYellow: 'var(--yellow90)',
          darkBlue: 'var(--blue90)',
          darkGreen: 'var(--green90)'
        },
        mid: {
          blue: 'var(--blue50)',
          purple: 'var(--purple50)'
        },
        red: {
          light: 'var(--red15)',
          dark: 'var(--red90)'
        }
      }
    },
    extend: {
      colors: {
        'dark-theme-background': 'var(--gray90)',
        'light-theme-background': 'var(--gray00)',
        // Foreground
        'foreground-primary': 'var(--foreground-primary)',
        'foreground-secondary': 'var(--foreground-secondary)',
        'foreground-tertiary': 'var(--foreground-tertiary)',
        'foreground-quaternary': 'var(--foreground-quaternary)',
        'foreground-muted': 'var(--foreground-muted)',
        'foreground-danger': 'var(--foreground-danger)',
        'foreground-danger-disabled': 'var(--foreground-danger-disabled)',
        'foreground-success': 'var(--foreground-success)',
        'foreground-info': 'var(--foreground-info)',
        'foreground-warning': 'var(--foreground-warning)',
        // Background
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        'background-quaternary': 'var(--background-quaternary)',
        'background-danger': 'var(--background-danger)',
        'background-danger-disabled': 'var(--background-danger-disabled)',
        'background-success': 'var(--background-success)',
        'background-info': 'var(--background-info)',
        // Focus outline
        'focus-outline-color': 'var(--focus-outline-color)',
        gray: {
          0: 'var(--gray00)',
          50: 'var(--gray05)',
          100: 'var(--gray10)',
          150: 'var(--gray15)',
          400: 'var(--gray40)',
          450: 'var(--gray45)',
          500: 'var(--gray50)',
          750: 'var(--gray75)',
          800: 'var(--gray80)',
          850: 'var(--gray85)',
          900: 'var(--gray90)'
        },
        green: {
          50: 'var(--green05)',
          100: 'var(--green10)',
          400: 'var(--green40)',
          700: 'var(--green70)',
          800: 'var(--green80)',
          900: 'var(--green90)'
        },
        blue: {
          50: 'var(--blue05)',
          100: 'var(--blue10)',
          300: 'var(--blue30)',
          500: 'var(--blue50)',
          700: 'var(--blue70)',
          900: 'var(--blue90)'
        },
        yellow: {
          50: 'var(--yellow05)',
          100: 'var(--yellow10)',
          400: 'var(--yellow40)',
          450: 'var(--yellow45)',
          500: 'var(--yellow50)',
          700: 'var(--yellow70)',
          800: 'var(--yellow80)',
          900: 'var(--yellow90)'
        },
        red: {
          50: 'var(--red05)',
          100: 'var(--red10)',
          150: 'var(--red15)',
          300: 'var(--red30)',
          700: 'var(--red70)',
          800: 'var(--red80)',
          900: 'var(--red90)',
          1000: 'var(--red100)'
        },
        orange: {
          300: 'var(--orange30)'
        },
        purple: {
          100: 'var(--purple10)',
          500: 'var(--purple50)',
          900: 'var(--purple90)'
        }
      },
      borderWidth: {
        1: '1px',
        3: '3px'
      },
      outlineWidth: {
        3: '3px'
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        mono: ['Hack-ZeroSlash', 'monospace']
      },
      fontSize: {
        // [fontSize, lineHeight]
        sm: ['16px', '1.5'],
        md: ['18px', '1.42857143'],
        lg: ['24px', '1.3333333']
      }
    }
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('aria-disabled', '&[aria-disabled="true"]');
      addVariant('aria-expanded', '&[aria-expanded="true"]');
    })
  ]
};
