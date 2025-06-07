// utils/http.js - Using REAL nuxt-auth-utils session data
export const httpClient = {
  async get(url, options = {}) {
    // Use REAL nuxt-auth-utils session
    const { session } = useUserSession()
    
    return await $fetch(url, {
      method: 'GET',
      headers: {
        ...options.headers,
        ...(session.value?.accessToken && {
          Authorization: `Bearer ${session.value.accessToken}`
        })
      },
      ...options
    })
  },

  async post(url, data, options = {}) {
    // Use REAL nuxt-auth-utils session
    const { session } = useUserSession()
    
    return await $fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        ...options.headers,
        ...(session.value?.accessToken && {
          Authorization: `Bearer ${session.value.accessToken}`
        })
      },
      ...options
    })
  },

  async put(url, data, options = {}) {
    // Use REAL nuxt-auth-utils session
    const { session } = useUserSession()
    
    return await $fetch(url, {
      method: 'PUT',
      body: data,
      headers: {
        ...options.headers,
        ...(session.value?.accessToken && {
          Authorization: `Bearer ${session.value.accessToken}`
        })
      },
      ...options
    })
  },

  async delete(url, options = {}) {
    // Use REAL nuxt-auth-utils session
    const { session } = useUserSession()
    
    return await $fetch(url, {
      method: 'DELETE',
      headers: {
        ...options.headers,
        ...(session.value?.accessToken && {
          Authorization: `Bearer ${session.value.accessToken}`
        })
      },
      ...options
    })
  }
}