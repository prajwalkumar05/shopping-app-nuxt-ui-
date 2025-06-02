import { defineStore } from "pinia";
import { navigateTo } from "#app";
import axios from "axios";

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
        return new Promise((resolve) => resolve(false));
      }

      return new Promise((resolve, reject) => {
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
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          this.logout();
          resolve(false);
        }
      });
    },

    // Login user
    login(credentials) {
      this.loading = true;
      this.error = null;

      return axios.post("https://dummyjson.com/auth/login", {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: 30,
      })
      .then((response) => {
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
      })
      .catch((error) => {
        this.error = error.message || "Login failed";
        throw error;
      })
      .finally(() => {
        this.loading = false;
      });
    },

    // Refresh expired token
    refreshExpiredToken() {
      const refreshToken = localStorage.getItem("refreshToken");
      const rememberMe = JSON.parse(
        localStorage.getItem("rememberMe") || "false"
      );

      return new Promise((resolve) => {
        if (rememberMe && refreshToken) {

          axios.post("https://dummyjson.com/auth/refresh", {
            refreshToken: refreshToken,
            expiresInMins: 30,
          })
          .then((response) => {
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

            resolve(false); // Session NOT expired, continue
          })
          .catch((error) => {
            this.clearAuthData();
            resolve(true); // Session expired, need logout
          });
        } else {
          this.clearAuthData();
          resolve(true); 
        }
      });
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
      navigateTo("/auth/login");
    },

    // Clear error
    clearError() {
      this.error = null;
    },
  },
});