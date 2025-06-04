// stores/auth.js
import { defineStore } from "pinia";
import axios from "axios";
import { ROUTES } from "~/config/routes";
import { getUserLoginApi, getUserRefreshTokenApi } from "~/services/api/auth/user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    getUser: (state) => state.user,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
  },

  actions: {
    // Clear error
    clearError() {
      this.error = null;
    },

    // Check session validity
    async checkAuth() {
      try {
        const response = await axios.get('/api/auth/me', { 
          withCredentials: true 
        });
        
        this.user = response.data.user;
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        return false;
      }
    },

    // Login
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/auth/login', credentials, {
          withCredentials: true
        });

        // Check if login was successful
        if (response.data && response.data.success && response.data.user) {
          this.user = response.data.user;
          this.isAuthenticated = true;
          return { success: true };
        } else {
          throw new Error('Invalid response from server');
        }

      } catch (error) {
        // Handle different types of errors
        if (error.response) {
          this.error = error.response.data?.message || error.response.data?.statusMessage || 'Login failed';
        } 
        
        this.isAuthenticated = false;
        this.user = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Logout
    async logout() {
      try {
        await axios.post('/api/auth/logout', {}, { 
          withCredentials: true 
        });
      } catch (error) {
        return 
      }
      
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      await navigateTo(ROUTES.auth.login);
    }
  }
});