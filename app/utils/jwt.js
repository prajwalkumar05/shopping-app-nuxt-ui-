// Parse JWT token
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

// Check if token is expired
export function isTokenExpired(token) {
  if (!token) return true

  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}
