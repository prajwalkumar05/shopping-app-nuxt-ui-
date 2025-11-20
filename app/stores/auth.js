import { defineStore } from "pinia";
import axios from "axios";
import { ROUTES } from "~/config/routes";

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
    clearError() {
      this.error = null;
    },

    clearAuthState() {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    },

    async checkAuth() {
      try {
        const response = await axios.get('/api/auth/me', { 
          withCredentials: true 
        });
        
        this.user = response.data.user;
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        this.clearAuthState();
        return false;
      }
    },

    async forceLogout(reason = 'Session expired') {
      this.clearAuthState();
      
      try {
        await axios.post('/api/auth/logout', {}, { 
          withCredentials: true,
          timeout: 20000
        });
      } catch (error) {
        // Ignore logout API errors
      }
      
      await navigateTo(ROUTES.auth.login, { replace: true });
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/auth/login', credentials, {
          withCredentials: true
        });

        if (response.data && response.data.success && response.data.user) {
          this.user = response.data.user;
          this.isAuthenticated = true;
          return { success: true };
        } else {
          throw new Error('Invalid response from server');
        }

      } catch (error) {
        if (error.response) {
          this.error = error.response.data?.message || error.response.data?.statusMessage || 'Login failed';
        } else if (error.request) {
          this.error = 'Network error. Please check your connection.';
        } else {
          this.error = error.message || 'Login failed';
        }
        
        this.clearAuthState();
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await this.forceLogout('Manual logout');
    }
  }
});