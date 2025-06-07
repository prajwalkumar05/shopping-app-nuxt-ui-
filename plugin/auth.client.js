export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client-side
  if (process.server) return

  const { initAuth, validateSession } = useAuthEnhanced()

  // Initialize auth when app is mounted (matches your current system)
  nuxtApp.hook("app:mounted", async () => {
    await initAuth()
  })

  // Handle page visibility changes (matches your current system)
  const handleVisibilityChange = async () => {
    if (!document.hidden) {
      await validateSession()
    }
  }

  // Handle focus events (matches your current system)
  const handleFocus = async () => {
    await validateSession()
  }

  // Add event listeners (matches your current system)
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