import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: {
    port: 3000,
  },
  site:
    process.env.CONTEXT === "production"
      ? process.env.URL
      : process.env.DEPLOYED_URL,
  output: "server",
  adapter: vercel(),
});
