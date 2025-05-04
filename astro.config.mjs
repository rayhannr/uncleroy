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
  trailingSlash: 'never',
  adapter: vercel({ webAnalytics: { enabled: true } }),
  redirects: {
    '/blog/what-it-means-to-be-a-qawwam': '/blog/qawwam-meaning-in-the-quran',
    '/blog/500-days-of': '/blog/relationship-lessons-500-days-of-summer',
    '/blog/begin-again': '/blog/blogging-journey-technical-writing',
    '/blog/digital-wedding-invitation-features-that-need-to-improve': '/blog/tired-of-digital-wedding-invites',
    '/blog/install-npm-dependencies-from-multiple-registries': '/blog/install-npm-multiple-registries',
    '/blog/cache-control-for-react-app-using-nginx': '/blog/nginx-cache-control-react-performance'
  },
  integrations: [
    sitemap({
      lastmod: new Date(),
      serialize(item) {
        item.url = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url
        return item
      },
      filter: (page) => !page.includes('merawat-luka-batin')
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
