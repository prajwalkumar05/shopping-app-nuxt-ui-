"use client"

import { computed, ref } from "vue"
import { navigateTo } from "#app"
import { isTokenExpired } from "~/utils/jwt"

export const useAuthEnhanced = () => {
  // @sidebase/nuxt-auth composable
  const { data: userData, status, token, signIn: baseSignIn, signOut: baseSignOut, refresh: baseRefresh } = useAuth()

  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const loggedIn = computed(() => status.value === "authenticated")
  const user = computed(() => userData.value)

  // Enhanced login function
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const loginData = {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.remember ? 60 * 24 * 30 : 5, // 30 days or 5 mini
      }

      // Use @sidebase/nuxt-auth signIn
      const result = await baseSignIn(loginData, { redirect: false })

      if (status.value === "authenticated" && token.value) {
        return {
          success: true,
          user: userData.value,
        }
      } else {
        throw new Error("Authentication failed")
      }
    } catch (err) {
      error.value = err.message || "Login failed"
      throw err
    } finally {
      loading.value = false
    }
  }

  // Enhanced logout function
  const logout = async (reason = "manual") => {
    loading.value = true

    try {
      //  @sidebase/nuxt-auth signOut
      await baseSignOut({ redirect: false })

      if (reason === "expired") {
        console.log("Session expired - logging out")
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      loading.value = false

      // Navigate to login page
      if (process.client && window.location.pathname !== "/auth/login") {
        await navigateTo("/auth/login", { replace: true })
      }
    }
  }

  // Validate session - check token expiration
  const validateSession = async () => {
    if (!loggedIn.value || !token.value) {
      return false
    }

    // Check if token is expired
    if (isTokenExpired(token.value)) {
      try {
        await baseRefresh()

        // Check if refresh was successful
        if (status.value === "authenticated" && token.value && !isTokenExpired(token.value)) {
          return true
        } else {
          // Refresh failed, logout
          await logout("expired")
          return false
        }
      } catch (err) {
        await logout("expired")
        return false
      }
    }

    return true
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    loggedIn,
    user,
    loading,
    error,
    token,
    status,

    // Actions
    login,
    logout,
    validateSession,
    clearError,
  }
}
