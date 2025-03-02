// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
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
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [
    sitemap({
      lastmod: new Date(),
      serialize(item) {
        item.url = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url
        return item
      }
    }),
    expressiveCode({
      themes: ['material-theme-ocean'],
      styleOverrides: {
        uiFontFamily: 'Geist, sans-serif',
        codeFontFamily: "'Geist Mono', ui-monospace, monospace"
      }
    })
  ],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 61440
    }
  },
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [htmlClassNames],
    rehypePlugins: [[externalLink, { domain: siteDomain }]]
  }
})
