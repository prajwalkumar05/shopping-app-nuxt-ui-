export default defineNuxtPlugin(() => {
  const { $i18n } = useNuxtApp()

  // Get language from i18n (which gets it from cookies automatically)
  const getCurrentLanguage = () => {
    return $i18n?.locale?.value || 'en'
  }

  // automatically adds language headers
  globalThis.$fetch = $fetch.create({
    onRequest({ request, options }) {
      const currentLanguage = getCurrentLanguage()
      
      // Add language headers to all requests
      options.headers = {
        'Accept-Language': currentLanguage,
        'X-User-Language': currentLanguage,
        ...options.headers  // Keep existing headers
      }


      if (process.dev) {
        console.log(`api Call: ${request} with language: ${currentLanguage}`)
      }
    },

    onResponseError({ request, response }) {
      if (process.dev) {
        console.error(`❌ API Error: ${response.status} for ${request}`)
      }
    }
  })

  // regular fetch for external APIs
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, init = {}) => {
    const currentLanguage = getCurrentLanguage()
    
    const enhancedInit = {
      ...init,
      headers: {
        'Accept-Language': currentLanguage,
        'X-User-Language': currentLanguage,
        ...init.headers
      }
    }
    
    return originalFetch(input, enhancedInit)
  }

  // Watch for language changes and log them
  if (process.client && $i18n) {
    watch(() => $i18n.locale.value, (newLocale, oldLocale) => {
      if (process.dev && oldLocale) {
        console.log(`🔄 Language changed: ${oldLocale} → ${newLocale}`)
      }
    })
  }

  console.log('Language Headers Plugin loaded successfully')
})
