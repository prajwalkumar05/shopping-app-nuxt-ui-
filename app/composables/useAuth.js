"use client";

import { computed, ref } from "vue";
import { navigateTo } from "#app";
import { isTokenExpired } from "~/utils/jwt";

export const useAuthEnhanced = () => {
  // @sidebase/nuxt-auth composable
  const {
    data: userData,
    status,
    token,
    signIn: baseSignIn,
    signOut: baseSignOut,
    refresh: baseRefresh,
  } = useAuth();

  const loading = ref(false);
  const error = ref(null);

  // Computed properties
  const loggedIn = computed(() => status.value === "authenticated");
  const user = computed(() => userData.value);


  const encode = (value) => {
    try {
      return btoa(JSON.stringify(value));
    } catch (error) {
      console.error("Failed to encode:", error);
      return null;
    }
  };


  const decode = (value) => {
    try {
      return JSON.parse(atob(value));
    } catch (error) {
      console.error("Failed to decode:", error);
      return null;
    }
  };


  const setRememberMe = (remember) => {
    if (process.client) {
      try {
        if (remember) {
          const rememberData = {
            value: true,
            timestamp: Date.now(),
            expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
          };
          
          // Encode the data 
          const encodedData = encode(rememberData);
          if (encodedData) {
            localStorage.setItem("auth.remember", encodedData);
          }
        } else {
          localStorage.removeItem("auth.remember");
        }
      } catch (error) {
        console.error("Failed to set remember me:", error);
      }
    }
  };

  // Get remember 
  const getRememberMe = () => {
    if (!process.client) return false;

    try {
      const stored = localStorage.getItem("auth.remember");
      if (!stored) return false;

      // Decode the stored data
      const rememberData = decode(stored);
      if (!rememberData) {
        localStorage.removeItem("auth.remember");
        return false;
      }
      
      // Check if expired
      if (Date.now() > rememberData.expiresAt) {
        localStorage.removeItem("auth.remember");
        return false;
      }

      return rememberData.value || false;
    } catch (error) {
      console.error("Failed to get remember me:", error);
      localStorage.removeItem("auth.remember");
      return false;
    }
  };

  // Enhanced login function
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      const loginData = {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.remember ? 30 : 5,
      };

      // Store remember 
      setRememberMe(credentials.remember);

      await baseSignIn(loginData, { redirect: false });

      if (status.value === "authenticated" && token.value) {
        return {
          success: true,
          user: userData.value,
        };
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err) {
      error.value = err.message || "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Enhanced logout function
  const logout = async (reason = "manual") => {
    loading.value = true;

    try {
      if (reason === "manual") {
        setRememberMe(false);
      }

      await baseSignOut({ redirect: false });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      loading.value = false;

      // Navigate to login page
      if (process.client && window.location.pathname !== "/auth/login") {
        await navigateTo("/auth/login", { replace: true });
      }
    }
  };

  // checking token expiration
  const validateSession = async () => {
    if (!loggedIn.value || !token.value) {
      return false;
    }

    const rememberMe = getRememberMe();

    // Check if token is expired
    if (isTokenExpired(token.value)) {
      try {
        await baseRefresh();

        // Check if refresh was successful
        if (
          status.value === "authenticated" &&
          token.value &&
          !isTokenExpired(token.value)
        ) {
          return true;
        } else {
          // Only logout if remember me is not enabled
          if (!rememberMe) {
            await logout("expired");
          }
          return false;
        }
      } catch (err) {
        // Only logout if remember me is not enabled
        if (!rememberMe) {
          await logout("expired");
        }
        return false;
      }
    }

    return true;
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  // Clear remember me from localStorage
  const clearRememberMe = () => {
    setRememberMe(false);
  };

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
    clearRememberMe,

    // Utilities
    getRememberMe,
    setRememberMe,
  };
};