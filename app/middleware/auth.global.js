"use client"

import { useAuthStore } from "~/stores/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Skip middleware on server
  if (process.server) return

  await authStore.initAuth()

  // Token expiry check and refresh
  const expiryTime = localStorage.getItem('expiryTime')
  
  if (expiryTime && Date.now() > parseInt(expiryTime)) {
    console.log('Token expired, attempting refresh...')
    await authStore.refreshExpiredToken()
    
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register']
  
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!authStore.isAuthenticated) {
    if (to.path === '/') {
      return navigateTo('/auth/login')
    }
    if (isPublicRoute) {
      return // Allow access
    }
    return navigateTo('/auth/login')
  } 
  
  // If user IS authenticated
  else {
    if (isPublicRoute) {
      return navigateTo('/')
    }
    return // Allow access
  }
})