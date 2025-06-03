"use client";

import { useAuthStore } from "~/stores/auth";
import { ROUTES, PUBLIC_ROUTES } from "~/config/routes";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Skip middleware on server
  if (process.server) return;

  await authStore.initAuth();

  const expiryTime = localStorage.getItem("expiryTime");

  if (expiryTime && Date.now() > parseInt(expiryTime)) {
    await authStore.refreshExpiredToken();
  }

  // Checking if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(to.path);

  if (!authStore.isAuthenticated) {
    if (to.path === ROUTES.app.home) {
      return navigateTo(ROUTES.auth.login);
    }

    if (isPublicRoute) {
      return;
    }

    // Redirect ti login
    return navigateTo(ROUTES.auth.login);
  }

  // If user IS authenticated
  else {
    // Redirect to home page
    if (isPublicRoute && to.path !== ROUTES.app.home) {
      return navigateTo(ROUTES.app.home);
    }

    return;
  }
});
