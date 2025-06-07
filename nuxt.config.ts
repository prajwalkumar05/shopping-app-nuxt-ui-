// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth'
  ],
  
  auth: {
    // Base URL for DummyJSON API
    baseURL: 'https://dummyjson.com/auth',
    
    // Global middleware (protects all routes by default)
    globalAppMiddleware: true,
    
    // Local provider configuration
    provider: {
      type: 'local',
      
      // Pages configuration
      pages: {
        login: '/auth/login'
      },
      
      // API endpoints
      endpoints: {
        signIn: { 
          path: '/login', 
          method: 'post' 
        },
        signOut: false, // No logout endpoint needed for DummyJSON
        getSession: { 
          path: '/me', 
          method: 'get' 
        }
      },
      
      // Token configuration - matches your current system
      token: {
        // Extract token from DummyJSON response
        signInResponseTokenPointer: '/token',
        
        // Token type for Authorization header
        type: 'Bearer',
        
        // Cookie configuration - CLIENT ACCESSIBLE
        cookieName: 'auth.token',
        headerName: 'Authorization',
        
        // Default to 5 minutes (will be overridden by remember me logic)
        maxAgeInSeconds: 300, // 5 minutes default
        
        // Security settings
        sameSiteAttribute: 'lax',
        secureCookieAttribute: process.env.NODE_ENV === 'production',
        httpOnlyCookieAttribute: false, // ✅ CRITICAL: Client must access token
      },
      
      // Refresh token configuration
      refreshToken: {
        signInResponseRefreshTokenPointer: '/refreshToken',
        cookieName: 'auth.refresh-token',
        maxAgeInSeconds: 60 * 60 * 24 * 7, // 7 days
        secureCookieAttribute: process.env.NODE_ENV === 'production',
        httpOnlyCookieAttribute: false,
      },
      
      // Session data type definition
      sessionDataType: {
        id: 'number',
        username: 'string',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        image: 'string',
        gender: 'string'
      }
    },
    
    // Session refresh configuration
    session: {
      enableRefreshOnWindowFocus: true,
      enableRefreshPeriodically: false // We'll handle this manually
    }
  },
  
  // Runtime config
  runtimeConfig: {
    public: {
      authUrl: process.env.AUTH_ORIGIN || 'http://localhost:3000'
    }
  }
})