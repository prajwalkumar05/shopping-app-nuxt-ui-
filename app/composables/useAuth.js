import { computed, ref, readonly } from 'vue'

// Global timer for session expiry (matches your current system)
let globalExpiryTimer = null

export const useAuthEnhanced = () => {
  // Get the base auth from @sidebase/nuxt-auth
  const { 
    data: userData, 
    status, 
    token,
    signIn: baseSignIn, 
    signOut: baseSignOut,
    getSession,
    refresh
  } = useAuth()

  const loading = ref(false)
  const error = ref(null)

  // Computed properties that match your current API
  const loggedIn = computed(() => status.value === 'authenticated')
  const user = computed(() => userData.value)
  const session = computed(() => {
    if (!token.value || !userData.value) return null
    
    return {
      accessToken: token.value,
      refreshToken: token.value, // DummyJSON uses same token
      user: userData.value,
      rememberMe: checkRememberMe(),
      loggedInAt: new Date().toISOString()
    }
  })

  // Check if remember me is active by checking token expiry
  const checkRememberMe = () => {
    if (!process.client) return false
    const authCookie = useCookie('auth.token')
    if (!authCookie.value) return false
    
    // Check localStorage for remember me flag
    return localStorage.getItem('auth_remember_me') === 'true'
  }

  // Enhanced login function that matches your current functionality
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      // Calculate expiry based on remember me
      const expiresInMins = credentials.remember_me ? 43200 : 5 // 30 days or 5 minutes

      // Prepare credentials for DummyJSON (matches your current format)
      const loginData = {
        username: credentials.username,
        password: credentials.password,
        expiresInMins
      }

      // Use @sidebase/nuxt-auth signIn
      const result = await baseSignIn(loginData, { 
        redirect: false 
      })

      if (status.value === 'authenticated') {
        // Store remember me preference in localStorage
        if (process.client) {
          if (credentials.remember_me) {
            localStorage.setItem('auth_remember_me', 'true')
            localStorage.setItem('auth_session_expires', new Date(Date.now() + 43200 * 60 * 1000).toISOString())
          } else {
            localStorage.setItem('auth_remember_me', 'false')
            localStorage.setItem('auth_session_expires', new Date(Date.now() + 5 * 60 * 1000).toISOString())
            
            // Setup auto-logout timer for non-remember-me sessions (matches your system)
            setupExpiryTimer(5 * 60 * 1000) // 5 minutes
          }
        }

        return { 
          success: true, 
          user: userData.value 
        }
      } else {
        throw new Error('Authentication failed')
      }

    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Enhanced logout function
  const logout = async (reason = 'manual') => {
    loading.value = true

    try {
      // Clear expiry timer
      clearExpiryTimer()

      // Clear remember me data
      if (process.client) {
        localStorage.removeItem('auth_remember_me')
        localStorage.removeItem('auth_session_expires')
      }

      // Use @sidebase/nuxt-auth signOut
      await baseSignOut({ redirect: false })

      if (reason === 'expired') {
        console.log('Session expired - logging out')
        // You can add toast notification here if needed
      }

    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      loading.value = false

      // Navigate to login page (matches your current behavior)
      if (process.client && window.location.pathname !== '/auth/login') {
        await navigateTo('/auth/login', { replace: true })
      }
    }
  }

  // Setup expiry timer (matches your current system exactly)
  const setupExpiryTimer = (timeInMs) => {
    clearExpiryTimer()

    if (timeInMs <= 0) {
      logout('expired')
      return
    }

    // Global timer that persists across navigation
    globalExpiryTimer = setTimeout(() => {
      logout('expired')
    }, timeInMs)

    console.log(`Session will expire in ${Math.round(timeInMs / 1000)} seconds`)
  }

  // Clear expiry timer
  const clearExpiryTimer = () => {
    if (globalExpiryTimer) {
      clearTimeout(globalExpiryTimer)
      globalExpiryTimer = null
    }
  }

  // Check if token is expired
  const isTokenExpired = () => {
    if (!process.client) return false
    
    const expiresAt = localStorage.getItem('auth_session_expires')
    if (!expiresAt) return false
    
    return new Date() > new Date(expiresAt)
  }

  // Validate session (matches your current logic)
  const validateSession = async () => {
    if (!loggedIn.value || !token.value) {
      return false
    }

    const rememberMe = localStorage.getItem('auth_remember_me') === 'true'

    // For non-remember-me sessions, check expiry immediately
    if (!rememberMe && isTokenExpired()) {
      await logout('expired')
      return false
    }

    // For remember-me sessions, try to refresh if expired
    if (rememberMe && isTokenExpired()) {
      const refreshed = await refreshToken()
      if (!refreshed) {
        await logout('expired')
        return false
      }
    }

    return true
  }

  // Refresh token (for remember-me sessions)
  const refreshToken = async () => {
    const rememberMe = localStorage.getItem('auth_remember_me') === 'true'
    
    if (!token.value || !rememberMe) {
      return false
    }

    try {
      // Use @sidebase/nuxt-auth getSession to refresh
      await getSession()
      
      if (status.value === 'authenticated') {
        // Update expiry time
        if (process.client) {
          const newExpiry = new Date(Date.now() + 43200 * 60 * 1000) // 30 days
          localStorage.setItem('auth_session_expires', newExpiry.toISOString())
        }
        return true
      }
    } catch (error) {
      console.log('Token refresh failed:', error)
      return false
    }

    return false
  }

  // Initialize auth (matches your current system)
  const initAuth = async () => {
    if (!process.client) return

    // Check if we have stored session data
    const rememberMe = localStorage.getItem('auth_remember_me')
    const expiresAt = localStorage.getItem('auth_session_expires')

    if (rememberMe && expiresAt) {
      // Check if session is expired
      if (isTokenExpired()) {
        if (rememberMe === 'true') {
          // Try to refresh for remember-me sessions
          const refreshed = await refreshToken()
          if (!refreshed) {
            await logout('expired')
            return
          }
        } else {
          // Expired non-remember-me session
          await logout('expired')
          return
        }
      }

      // Setup timer for non-remember-me sessions
      if (rememberMe === 'false' && !globalExpiryTimer) {
        const timeUntilExpiry = new Date(expiresAt).getTime() - Date.now()
        if (timeUntilExpiry > 0) {
          setupExpiryTimer(timeUntilExpiry)
        } else {
          await logout('expired')
        }
      }
    }
  }

  // Get session info (matches your current API)
  const getSessionInfo = () => {
    if (!session.value) return null

    const expiresAt = localStorage.getItem('auth_session_expires')
    const timeUntilExpiry = expiresAt 
      ? Math.max(0, new Date(expiresAt).getTime() - Date.now())
      : 0

    return {
      isLoggedIn: loggedIn.value,
      user: user.value,
      expiresAt,
      rememberMe: checkRememberMe(),
      timeUntilExpiry,
      isExpired: isTokenExpired(),
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State (matches your current API exactly)
    loggedIn: readonly(loggedIn),
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),

    // Actions (matches your current API exactly)
    login,
    logout,
    validateSession,
    refreshToken,
    initAuth,
    clearError,

    // Getters (matches your current API exactly)
    getSessionInfo,
    isTokenExpired,

    // Utils (matches your current API exactly)
    clearExpiryTimer,

    // Additional @sidebase/nuxt-auth specific
    token: readonly(token),
    status: readonly(status)
  }
}