export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server-side
  if (process.server) return

  const { loggedIn, validateSession } = useAuthEnhanced()

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register"]
  const isPublicRoute = publicRoutes.includes(to.path)

  // Auth routes (login, register)
  const authRoutes = ["/auth/login", "/auth/register"]
  const isAuthRoute = authRoutes.includes(to.path)

  // Always validate session on route changes (matches your current system)
  if (loggedIn.value) {
    const isValid = await validateSession()

    // If session is invalid, user will be logged out by validateSession
    if (!isValid && !isPublicRoute) {
      return navigateTo("/auth/login")
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute) {
      return navigateTo("/")
    }
  }
  // User is not logged in
  else if (!isPublicRoute) {
    // Redirect to login for protected routes
    return navigateTo("/auth/login")
  }
})