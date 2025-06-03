import { defineStore } from "pinia";
import { navigateTo } from "#app";
import axios from "axios";
import { getUserLoginApi, getUserRefreshTokenApi } from "~/services/api/auth/user";
import { ROUTES } from "~/config/routes";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
    rememberMe: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isLoading: (state) => state.loading,
    getUser: (state) => state.user,
    getError: (state) => state.error,
  },

  actions: {
    // Initialize auth from localStorage
    initAuth() {
      if (!process.client) {
        return false;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem("user");
        const rememberMe = localStorage.getItem("rememberMe") === "true";

        if (token && user) {
          this.accessToken = token;
          this.refreshToken = refreshToken;
          this.user = JSON.parse(user);
          this.rememberMe = rememberMe;
          return true;
        }
        return false;
      } catch (error) {
        this.logout();
        return false;
      }
    },

    // Login user
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(getUserLoginApi(), {
          username: credentials.username,
          password: credentials.password,
          expiresInMins: 30,
        });

        const data = response.data;
        const token = data.accessToken || data.token;

        // Set state
        this.accessToken = token;
        this.refreshToken = data.refreshToken || null;
        this.user = {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        };
        this.rememberMe = credentials.remember_me || false;

        // Store in localStorage with expiry time
        if (process.client) {
          localStorage.setItem("accessToken", token);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          localStorage.setItem("user", JSON.stringify(this.user));
          localStorage.setItem("rememberMe", String(this.rememberMe));
          localStorage.setItem(
            "expiryTime",
            String(Date.now() + 30 * 60 * 1000)
          );
        }

        return { success: true };
      } catch (error) {
        this.error = error.message || "Login failed";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Refresh expired token
    async refreshExpiredToken() {
      const refreshToken = localStorage.getItem("refreshToken");
      const rememberMe = JSON.parse(
        localStorage.getItem("rememberMe") || "false"
      );

      if (!rememberMe || !refreshToken) {
        this.clearAuthData();
        return true; // Session expired, need logout
      }

      try {
        const response = await axios.post(getUserRefreshTokenApi(), {
          refreshToken: refreshToken,
          expiresInMins: 30,
        });

        const data = response.data;
        const newToken = data.accessToken || data.token;

        // Update state
        this.accessToken = newToken;
        if (data.refreshToken) {
          this.refreshToken = data.refreshToken;
        }

        // Update localStorage
        localStorage.setItem("accessToken", newToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        localStorage.setItem(
          "expiryTime",
          String(Date.now() + 30 * 60 * 1000)
        );

        return false; // Session NOT expired, continue
      } catch (error) {
        this.clearAuthData();
        return true; // Session expired, need logout
      }
    },

    // Clear auth data
    clearAuthData() {
      const itemsToRemove = [
        "accessToken",
        "refreshToken",
        "user",
        "rememberMe",
        "expiryTime",
      ];

      itemsToRemove.forEach((item) => localStorage.removeItem(item));

      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.rememberMe = false;
      this.error = null;
    },

    // Logout user
    logout() {
      this.clearAuthData();
      navigateTo(ROUTES.auth.login);
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});