export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@pinia/nuxt", "@sidebase/nuxt-auth", "@nuxtjs/i18n","@vueuse/nuxt"],

   plugins: [
    // './plugin/echo.client.js',        
    // './plugin/backendMimic.client.js', // Backend mimic second
    './plugin/pusher.client.js',
    './plugin/notifications.client.js'
  ],

  // Nuxt UI configuration with theme colors
  ui: {
    global: true,
    icons: ['lucide', 'heroicons'],
   
  },
  

  // Color mode configuration
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

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

  // Simple script - fixed dark mode flash
  app: {
    head: {
      meta: [
        { name: 'color-scheme', content: 'light dark' }
      ],
      script: [
        {
          innerHTML: `
            document.documentElement.classList.add(localStorage.getItem('nuxt-color-mode') || 'light');
            const theme = localStorage.getItem('app-theme') || 'green';
            const colors = {green:'#059669', red:'#f06595', purple:'#845ef7', blue:'#339af0'};
            document.documentElement.style.setProperty('--theme-primary', colors[theme]);
          `,
          type: 'text/javascript'
        }
      ]
    }
  },

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
      // apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "https://dummyjson.com",
      appName: process.env.APP_NAME || "Shopping App",
      authUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",

      reverbHost: "localhost",
      reverbPort: 6001,
      reverbKey: "fkll4yezwmuipofehws5",
      // apiBaseUrl: "http://localhost:8000",

       apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      authToken: process.env.NUXT_PUBLIC_AUTH_TOKEN,
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY,
      pusherHost: process.env.NUXT_PUBLIC_PUSHER_HOST,
      pusherPort: process.env.NUXT_PUBLIC_PUSHER_PORT
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",
})