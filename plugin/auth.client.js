// plugins/auth.client.js
export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client-side
  if (process.server) return

  const { initAuth, validateSession } = useAuth()

  // Initialize auth when app is mounted
  nuxtApp.hook("app:mounted", async () => {
    await initAuth()
  })

  // Handle page visibility changes (when user switches tabs and comes back)
  const handleVisibilityChange = async () => {
    if (!document.hidden) {
      // Page became visible, re-check auth status
      await validateSession()
    }
  }

  // Handle focus events (when user clicks back to the window)
  const handleFocus = async () => {
    await validateSession()
  }

  // Add event listeners
  if (process.client) {
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    // Clean up on app unmount
    nuxtApp.hook("app:beforeUnmount", () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    })
  }
})