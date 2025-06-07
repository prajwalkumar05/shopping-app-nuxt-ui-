// composables/useClientSession.js - Client-side session management
import { ref } from "vue"

const SESSION_KEY = "nuxt-auth-session"
const TEMP_SESSION_KEY = "nuxt-auth-temp-session"

// Reactive session state
const sessionData = ref(null)
const loggedInState = ref(false)
const userState = ref(null)

// Initialize session from storage on app start
const initializeSession = () => {
  if (!process.client) return

  // Try to get session from localStorage first (remember me)
  const persistentSession = localStorage.getItem(SESSION_KEY)
  if (persistentSession) {
    try {
      const data = JSON.parse(persistentSession)
      sessionData.value = data
      loggedInState.value = !!(data?.user && data?.accessToken)
      userState.value = data?.user || null
      return
    } catch (error) {
      console.error("Error parsing persistent session:", error)
      localStorage.removeItem(SESSION_KEY)
    }
  }

  // Try to get session from sessionStorage (temporary)
  const tempSession = sessionStorage.getItem(TEMP_SESSION_KEY)
  if (tempSession) {
    try {
      const data = JSON.parse(tempSession)
      sessionData.value = data
      loggedInState.value = !!(data?.user && data?.accessToken)
      userState.value = data?.user || null
      return
    } catch (error) {
      console.error("Error parsing temp session:", error)
      sessionStorage.removeItem(TEMP_SESSION_KEY)
    }
  }

  // No valid session found
  sessionData.value = null
  loggedInState.value = false
  userState.value = null
}

// Initialize on import
if (process.client) {
  initializeSession()
}

export const useClientSession = () => {
  // Set session
  const setSession = (data) => {
    sessionData.value = data
    loggedInState.value = !!(data?.user && data?.accessToken)
    userState.value = data?.user || null

    if (!process.client) return

    if (data.rememberMe) {
      // Store in localStorage for persistent sessions
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
      // Remove from sessionStorage if it exists
      sessionStorage.removeItem(TEMP_SESSION_KEY)
    } else {
      // Store in sessionStorage for temporary sessions
      sessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(data))
      // Remove from localStorage if it exists
      localStorage.removeItem(SESSION_KEY)
    }
  }

  // Clear session
  const clearSession = () => {
    sessionData.value = null
    loggedInState.value = false
    userState.value = null

    if (!process.client) return

    // Clear both storage types
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TEMP_SESSION_KEY)
  }

  // Refresh session (re-read from storage)
  const refreshSession = () => {
    if (!process.client) return
    initializeSession()
  }

  return {
    loggedIn: loggedInState,
    user: userState,
    session: sessionData,
    setSession,
    clearSession,
    refreshSession,
  }
}
