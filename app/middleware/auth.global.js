import { defineNuxtRouteMiddleware, navigateTo, useAuthEnhanced } from "#imports"
import { ROUTES, PUBLIC_ROUTES } from "~/config/routes"

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server-side
  if (process.server) return

  const { loggedIn, validateSession } = useAuthEnhanced()

  // public routes
  const isPublicRoute = PUBLIC_ROUTES.includes(to.path)
  
  // Auth routes 
  const isAuthRoute = to.path.startsWith('/auth')

  // If user is logged in
  if (loggedIn.value) {
    // Always validate session on route changes
    const isValid = await validateSession()

    // If session is invalid
    if (!isValid && !isPublicRoute) {
      return navigateTo(ROUTES.auth.login) 
    }

    // Redirect home page
    if (isAuthRoute) {
      return navigateTo(ROUTES.app.home) 
    }
  }
  // User is not logged in
  else if (!isPublicRoute) {
    // Redirect to login 
    return navigateTo(ROUTES.auth.login) 
  }
})