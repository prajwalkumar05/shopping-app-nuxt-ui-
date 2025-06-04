// middleware/auth.global.js
import { ROUTES, PUBLIC_ROUTES } from "~/config/routes";

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  if (to.path.startsWith('/api/') || process.server) return;

  const authStore = useAuthStore();
  
  const isValid = await authStore.checkAuth();

  const publicRoutes = [
    ROUTES.app.home,        
    ROUTES.products.productsList, 
    ...PUBLIC_ROUTES           
  ];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/products/'); // For dynamic product details
  
  const isAuthRoute = PUBLIC_ROUTES.includes(to.path);

  // Not authenticated
  if (!isValid) {
    if (isPublicRoute) {
      return; // Allow access to public routes
    }
    return navigateTo(ROUTES.auth.login); // Redirect to login
  }

  // Authenticated - block auth pages
  if (isAuthRoute) {
    return navigateTo(ROUTES.app.home);
  }
});