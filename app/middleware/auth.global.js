// middleware/auth.global.js
import { ROUTES, PUBLIC_ROUTES } from "~/config/routes";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip API routes and server-side
  if (to.path.startsWith('/api/') || process.server) return;


  const authStore = useAuthStore();
  
  const isValid = await authStore.checkAuth();
  


  const authRoutes = PUBLIC_ROUTES; 
  const trulyPublicRoutes = [
    ROUTES.products.productsList 
  ];
  
  // Check route types
  const isAuthRoute = authRoutes.includes(to.path);
  const isTrulyPublic = trulyPublicRoutes.includes(to.path) || 
                       to.path.startsWith('/products/'); 
  

  // NOT AUTHENTICATED
  if (!isValid && !authStore.isAuthenticated) {
    
    // Allow only auth routes and truly public routes
    if (isAuthRoute || isTrulyPublic) {
      return;
    }
    
    return navigateTo(ROUTES.auth.login);
  }

  // AUTHENTICATED
  if (isValid && authStore.isAuthenticated) {
    // Block access to auth pages when authenticated
    if (isAuthRoute) {
      return navigateTo(ROUTES.app.home);
    }
    
    return;
  }

  await authStore.forceLogout('Mixed auth state detected');
});