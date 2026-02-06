// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/a11y',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  css: ['~/app.css'],
  
  // Static site generation
  ssr: false,
  
  // GitHub Pages deployment
  app: {
    baseURL: '/photos.brennan.sh/', // Replace with your repo name
    buildAssetsDir: 'assets',
  },
})