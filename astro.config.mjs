// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import expressiveCode from 'astro-expressive-code'
import { htmlClassNames } from './plugins/html-classnames.mjs'
import { externalLink } from './plugins/external-link'

const siteUrl =
  process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.CUSTOM_VERCEL_URL || process.env.VERCEL_URL}`
    : 'http://localhost:3000'
const siteDomain = siteUrl?.replace('https://', '')

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 61440
    }
  },
  integrations: [
    sitemap({ lastmod: new Date() }),
    expressiveCode({
      themes: ['catppuccin-mocha', 'catppuccin-latte']
    })
  ],
  server: {
    port: 3000
  },
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [htmlClassNames],
    rehypePlugins: [[externalLink, { domain: siteDomain }]]
  },
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  })
})
