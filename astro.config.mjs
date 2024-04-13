import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel/static'
import htmlClassNames from './plugins/html-classnames/index.mjs'

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
    remarkPlugins: [htmlClassNames]
  },
  site:
    process.env.VERCEL_ENV === 'production'
      ? `https://${process.env.CUSTOM_VERCEL_URL || process.env.VERCEL_URL}`
      : process.env.URL,
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  })
})
