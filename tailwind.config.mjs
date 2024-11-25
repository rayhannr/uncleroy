const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './plugins/**/*.mjs'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Geist Mono', ...fontFamily.mono]
      }
    }
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class'
}
