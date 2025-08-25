// https://nuxt.com/docs/api/configuration/nuxt-config

// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'fs'

// Read version from ./public/version.json
const versionFile = JSON.parse(readFileSync('./public/version.json', 'utf-8'))


export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

    plugins: [
    '~/plugin/version-check.client.js'
  ],


  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "https://dummyjson.com",
      appName: process.env.APP_NAME || "Shopping App",
      APP_VERSION: versionFile.version,
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  

  compatibilityDate: "2024-11-27",
});
