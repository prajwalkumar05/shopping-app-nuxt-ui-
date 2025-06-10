import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt", "@sidebase/nuxt-auth"],

  css: ["~/assets/css/main.css"],

  auth: {
    baseURL: "https://dummyjson.com/auth",
    globalAppMiddleware: {
      isEnabled: false, 
      addDefaultCallbackUrl: "/auth/login",
    },

    provider: {
      type: "local",

      pages: {
        login: "/auth/login",
      },

      endpoints: {
        signIn: {
          path: "/login",
          method: "post",
        },
        signOut: false,
        getSession: {
          path: "/me",
          method: "get",
        },
        refresh: {
          path: "/refresh",
          method: "post",
        } ,
      },

      token: {
        signInResponseTokenPointer: "/accessToken",
        type: "Bearer",
        cookieName: "auth.token",
        headerName: "Authorization",
        maxAgeInSeconds: 30 * 60, 
        sameSiteAttribute: "lax",
        httpOnlyCookieAttribute: false, 
      },

      refreshToken: {
        signInResponseRefreshTokenPointer: "/refreshToken",
        cookieName: "auth.refresh-token",
        maxAgeInSeconds: 30 * 60, 
        httpOnlyCookieAttribute: false,
      },

      sessionDataType: {
        id: "number",
        username: "string",
        email: "string",
        firstName: "string",
        lastName: "string",
        image: "string",
        gender: "string",
      },
    },

    session: {
      enableRefreshOnWindowFocus: false, 
      enableRefreshPeriodically: false, 
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "https://dummyjson.com",
      appName: process.env.APP_NAME || "Shopping App",
      authUrl: "http://localhost:3000",
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",
})