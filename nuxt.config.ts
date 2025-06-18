export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt", "@sidebase/nuxt-auth", "@nuxtjs/i18n"],

  i18n: {
    locales: [
      {
        code: "en",
        name: "English",
        file: "en.json",
        iso: "en-US"
      },
      {
        code: "hi",
        name: "हिंदी", 
        file: "hi.json",
        iso: "hi-IN"
      },
      {
        code: "kn",
        name: "ಕನ್ನಡ ", 
        file: "kn.json",
        iso: "kn-IN"
      },
    ],
    lazy: true,
    langDir: "locales/",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    compilation: {
      strictMessage: false,
    },
  },

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
        },
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
      authUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",
})