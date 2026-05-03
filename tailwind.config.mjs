/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        k8s: {
          blue: '#326CE5',
          'blue-dark': '#1a4fa0',
          'blue-light': '#5a8ef0',
          cyan: '#00BCD4',
          'cyan-dark': '#0097a7',
        },
        surface: {
          dark: '#0F1117',
          DEFAULT: '#1A1D2E',
          elevated: '#242838',
          border: '#2D3748',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.slate[300]'),
            '--tw-prose-headings': theme('colors.slate[100]'),
            '--tw-prose-links': theme('colors.sky[400]'),
            '--tw-prose-bold': theme('colors.slate[100]'),
            '--tw-prose-code': theme('colors.cyan[300]'),
            '--tw-prose-pre-bg': theme('colors.slate[900]'),
            '--tw-prose-quotes': theme('colors.slate[400]'),
            '--tw-prose-quote-borders': theme('colors.k8s.blue', '#326CE5'),
            '--tw-prose-hr': theme('colors.slate[700]'),
            '--tw-prose-th-borders': theme('colors.slate[600]'),
            '--tw-prose-td-borders': theme('colors.slate[700]'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
