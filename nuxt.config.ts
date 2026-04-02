// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'cloudflare-pages',
    node: true // Explicitly enable node polyfills in Nitro
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui'],
  future: {
    compatibilityVersion: 4
  }
})