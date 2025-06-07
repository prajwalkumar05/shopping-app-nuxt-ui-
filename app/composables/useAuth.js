// composables/useAuth.js
import { ref, readonly } from "vue"
import { navigateTo, useFetch } from "#app"

// Global reactive state (shared across all instances)
const globalLoggedIn = ref(false)
const globalUser = ref(null)
const globalSession = ref(null)

// Global timer that persists across navigation
let globalExpiryTimer = null

export const useAuth = () => {
  const loading = ref(false)
  const error = ref(null)

  // Login function
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      // Call external API
      const response = await useFetch("https://dummyjson.com/auth/login", {
        method: "POST",
        body: {
          username: credentials.username,
          password: credentials.password,
          expiresInMins: credentials.remember_me ? 43200 : 5, // 30 days or 5 minutes
        },
      })

      if (!response.data.value.token && !response.data.value.accessToken) {
        throw new Error("Invalid credentials")
      }

      // Calculate expiration times
      const now = new Date()
      const tokenExpiryMinutes = credentials.remember_me ? 43200 : 5
      const accessTokenExpiry = new Date(now.getTime() + tokenExpiryMinutes * 60 * 1000)
      const refreshTokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Create user session data
      const userData = {
        id: response.data.value.id,
        username: response.data.value.username,
        email: response.data.value.email,
        firstName: response.data.value.firstName,
        lastName: response.data.value.lastName,
        image: response.data.value.image,
        gender: response.data.value.gender,
      }

      // Create session data
      const sessionData = {
        accessToken: response.data.value.token || response.data.value.accessToken,
        refreshToken: response.data.value.refreshToken || response.data.value.token || response.data.value.accessToken,
        accessTokenExpiresAt: accessTokenExpiry.toISOString(),
        refreshTokenExpiresAt: refreshTokenExpiry.toISOString(),
        rememberMe: credentials.remember_me || false,
        loggedInAt: now.toISOString(),
      }

      // Update our global state directly
      globalUser.value = userData
      globalSession.value = sessionData
      globalLoggedIn.value = true

      // Also store in browser storage
      if (process.client) {
        const completeSessionData = {
          user: userData,
          ...sessionData
        }
        
        try {
          if (credentials.remember_me) {
            localStorage.setItem('auth_session', JSON.stringify(completeSessionData))
          } else {
            sessionStorage.setItem('auth_session', JSON.stringify(completeSessionData))
          }
          console.log('Session stored successfully')
        } catch (storageError) {
          console.error('Failed to store in browser storage:', storageError)
        }
      }

      // Setup auto-logout timer for non-remember-me sessions
      if (!credentials.remember_me) {
        setupExpiryTimer(tokenExpiryMinutes * 60 * 1000)
      }

      return { success: true, user: userData }
    } catch (err) {
      error.value = err.data?.message || err.message || "Login failed"
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update session function (for refreshToken and other updates)
  const updateSessionData = async (newData) => {
    try {
      // Update global session state
      if (globalSession.value) {
        globalSession.value = { ...globalSession.value, ...newData }
      } else {
        globalSession.value = newData
      }

      // Update browser storage
      if (process.client) {
        try {
          const sessionData = {
            user: globalUser.value,
            ...globalSession.value
          }
          
          if (globalSession.value?.rememberMe) {
            localStorage.setItem('auth_session', JSON.stringify(sessionData))
          } else {
            sessionStorage.setItem('auth_session', JSON.stringify(sessionData))
          }
        } catch (storageError) {
          console.error('Browser storage update failed:', storageError)
        }
      }
    } catch (err) {
      console.error('Failed to update session:', err)
    }
  }

  // Logout function
  const logout = async (reason = "manual") => {
    loading.value = true

    try {
      // Clear expiry timer
      clearExpiryTimer()

      // Clear global state
      globalUser.value = null
      globalSession.value = null
      globalLoggedIn.value = false

      // Clear browser storage
      if (process.client) {
        localStorage.removeItem('auth_session')
        sessionStorage.removeItem('auth_session')
      }

      if (reason === "expired") {
        console.log("Session expired - logging out")
        // You can add toast notification here if needed
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      loading.value = false

      // Only navigate if we're not already on login page
      if (process.client && window.location.pathname !== "/auth/login") {
        await navigateTo("/auth/login", { replace: true })
      }
    }
  }

  // Setup expiry timer for automatic logout (GLOBAL TIMER)
  const setupExpiryTimer = (timeInMs) => {
    clearExpiryTimer()

    if (timeInMs <= 0) {
      logout("expired")
      return
    }

    // Use global timer that persists across navigation
    globalExpiryTimer = setTimeout(() => {
      logout("expired")
    }, timeInMs)

    console.log(`Session will expire in ${Math.round(timeInMs / 1000)} seconds`)
  }

  // Clear expiry timer (GLOBAL TIMER)
  const clearExpiryTimer = () => {
    if (globalExpiryTimer) {
      clearTimeout(globalExpiryTimer)
      globalExpiryTimer = null
    }
  }

  // Check if token is expired
  const isTokenExpired = () => {
    if (!globalSession.value?.accessTokenExpiresAt) return true
    return new Date() > new Date(globalSession.value.accessTokenExpiresAt)
  }

  // Validate session
  const validateSession = async () => {
    if (!globalLoggedIn.value || !globalSession.value?.accessToken) {
      return false
    }

    // For non-remember-me sessions, check expiry immediately
    if (!globalSession.value.rememberMe && isTokenExpired()) {
      await logout("expired")
      return false
    }

    // For remember-me sessions, try to refresh if expired
    if (globalSession.value.rememberMe && isTokenExpired()) {
      const refreshed = await refreshToken()
      if (!refreshed) {
        await logout("expired")
        return false
      }
    }

    return true
  }

  // Refresh token (for remember-me sessions)
  const refreshToken = async () => {
    if (!globalSession.value?.refreshToken || !globalSession.value?.rememberMe) {
      return false
    }

    try {
      // In real app, you'd call refresh endpoint
      const response = await useFetch("https://dummyjson.com/auth/me", {
        headers: {
          Authorization: `Bearer ${globalSession.value.accessToken}`,
        },
      })

      if (response.data.value && response.data.value.id) {
        const now = new Date()
        const newExpiry = new Date(now.getTime() + 43200 * 60 * 1000) // 30 days

        // Update session with new expiry
        await updateSessionData({
          accessTokenExpiresAt: newExpiry.toISOString(),
          lastRefreshedAt: now.toISOString(),
        })

        return true
      }
    } catch (error) {
      console.log("Token refresh failed:", error)
      return false
    }

    return false
  }

  // Initialize from browser storage
  const initFromStorage = () => {
    if (!process.client) return

    try {
      // Check localStorage first (remember me)
      let sessionData = localStorage.getItem('auth_session')
      if (!sessionData) {
        // Check sessionStorage
        sessionData = sessionStorage.getItem('auth_session')
      }

      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        
        // Check if session is still valid
        if (parsed.accessTokenExpiresAt && new Date(parsed.accessTokenExpiresAt) > new Date()) {
          globalUser.value = parsed.user
          globalSession.value = {
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            accessTokenExpiresAt: parsed.accessTokenExpiresAt,
            refreshTokenExpiresAt: parsed.refreshTokenExpiresAt,
            rememberMe: parsed.rememberMe,
            loggedInAt: parsed.loggedInAt
          }
          globalLoggedIn.value = true
          
          console.log('Session restored from storage')
          
          // Setup expiry timer if not remember me AND timer doesn't already exist
          if (!parsed.rememberMe && !globalExpiryTimer) {
            const timeUntilExpiry = new Date(parsed.accessTokenExpiresAt).getTime() - Date.now()
            if (timeUntilExpiry > 0) {
              setupExpiryTimer(timeUntilExpiry)
            } else {
              // Session is expired, logout immediately
              logout("expired")
            }
          }
        } else {
          // Session expired, clean up
          localStorage.removeItem('auth_session')
          sessionStorage.removeItem('auth_session')
        }
      }
    } catch (err) {
      console.error('Failed to initialize auth from storage:', err)
    }
  }

  // Initialize auth monitoring
  const initAuth = async () => {
    if (!process.client) return

    // Initialize from storage first
    initFromStorage()

    // If not logged in after storage check, nothing to initialize
    if (!globalLoggedIn.value || !globalSession.value) {
      return
    }

    // Check if session is expired immediately
    if (isTokenExpired()) {
      if (!globalSession.value.rememberMe) {
        await logout("expired")
        return
      }
      // For remember-me sessions, try refresh
      const refreshed = await refreshToken()
      if (!refreshed) {
        await logout("expired")
        return
      }
    }

    // Setup auto-logout timer for non-remember-me sessions ONLY if timer doesn't exist
    if (!globalSession.value.rememberMe && globalSession.value.accessTokenExpiresAt && !globalExpiryTimer) {
      const expiryTime = new Date(globalSession.value.accessTokenExpiresAt).getTime()
      const currentTime = Date.now()
      const timeUntilExpiry = expiryTime - currentTime

      if (timeUntilExpiry > 0) {
        setupExpiryTimer(timeUntilExpiry)
      } else {
        await logout("expired")
      }
    }
  }

  // Get session info
  const getSessionInfo = () => {
    if (!globalSession.value) return null

    const timeUntilExpiry = globalSession.value.accessTokenExpiresAt
      ? Math.max(0, new Date(globalSession.value.accessTokenExpiresAt).getTime() - Date.now())
      : 0

    return {
      isLoggedIn: globalLoggedIn.value,
      user: globalUser.value,
      expiresAt: globalSession.value.accessTokenExpiresAt,
      rememberMe: globalSession.value.rememberMe,
      timeUntilExpiry,
      isExpired: isTokenExpired(),
    }
  }

  // Utility functions
  const clearError = () => {
    error.value = null
  }

  // Initialize from storage when composable is first used (but only once)
  if (process.client && !globalLoggedIn.value) {
    initFromStorage()
  }

  return {
    // State
    loggedIn: readonly(globalLoggedIn),
    user: readonly(globalUser),
    session: readonly(globalSession),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    login,
    logout,
    validateSession,
    refreshToken,
    initAuth,
    clearError,

    // Getters
    getSessionInfo,
    isTokenExpired,

    // Utils
    clearExpiryTimer,
  }
}