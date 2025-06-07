// middleware/auth.global.js
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server-side
  if (process.server) return

  const { loggedIn, validateSession } = useAuth()

  const publicRoutes = ["/auth/login", "/auth/register"]
  const isPublicRoute = publicRoutes.includes(to.path)

  // Auth routes (login, register)
  const authRoutes = ["/auth/login", "/auth/register"]
  const isAuthRoute = authRoutes.includes(to.path)

  if (loggedIn.value) {
    const isValid = await validateSession()

    if (!isValid && !isPublicRoute) {
      return navigateTo("/auth/login")
    }

    if (isAuthRoute) {
      return navigateTo("/")
    }
  }
  // User is not logged in
  else if (!isPublicRoute) {
    return navigateTo("/auth/login")
  }
})