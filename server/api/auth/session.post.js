// server/api/auth/session.post.js
import { defineEventHandler, readBody, setCookie, deleteCookie } from "h3"

// Session cookie name
const SESSION_COOKIE = "nuxt-session"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body.action === "set") {
    // Set session cookie
    setCookie(event, SESSION_COOKIE, JSON.stringify(body.sessionData), {
      httpOnly: true,
      path: "/",
      maxAge: body.sessionData.rememberMe ? 30 * 24 * 60 * 60 : 60 * 5, // 30 days or 5 minutes
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    return { success: true }
  }

  if (body.action === "clear") {
    // Clear session cookie
    deleteCookie(event, SESSION_COOKIE, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    return { success: true }
  }

  return { error: "Invalid action" }
})
