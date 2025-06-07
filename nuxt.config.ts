// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt", "nuxt-auth-utils"],

  css: ["~/assets/css/main.css"],




  runtimeConfig: {
    
  sessionPassword: process.env.NUXT_SESSION_PASSWORD || 'a7f3b9c55f3e72a1c9a27c4748b9d7ce3f5e8a1134ef8bc7c19ea7db471a2150',
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "https://dummyjson.com",
      appName: process.env.APP_NAME || "Shopping App",
    },
  },

  future: {
    compatibilityVersion: 4,
  },
  

  compatibilityDate: "2024-11-27",
});