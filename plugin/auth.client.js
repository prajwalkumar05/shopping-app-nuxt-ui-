import { defineNuxtPlugin } from "#app"
import { useAuthEnhanced } from "~/composables/authEnhanced"

export default defineNuxtPlugin(async (nuxtApp) => {
  // client-side
  if (process.server) return

  const { validateSession } = useAuthEnhanced()

  // page visibility changes for token validation
  const handleVisibilityChange = async () => {
    if (!document.hidden) {
      await validateSession()
    }
  }

  //  focus events for token validation
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
