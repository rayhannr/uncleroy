import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/static'
import htmlClassNames from './plugins/html-classnames/index.mjs'
import { externalLink } from './plugins/external-link'

const siteUrl =
  process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.CUSTOM_VERCEL_URL || process.env.VERCEL_URL}`
    : process.env.URL

const siteDomain = siteUrl?.replace('https://', '')

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false
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
  site: siteUrl,
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  })
})
