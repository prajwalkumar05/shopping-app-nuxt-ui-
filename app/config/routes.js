export const ROUTES = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register'
  },

  // App
  app: {
    home: '/'
  },

  // Products
  products: {
    productsList: '/products',
    details: '/products/[id]'
  }
}

export const DYNAMIC_ROUTES = {
  products: {
    productDetails: (id, locale = 'en') => {
      return locale === 'en' ? `/products/${id}` : `/${locale}/products/${id}`
    }
  }
}

// Public routes 
export const PUBLIC_ROUTES = [
  ROUTES.auth.login,
  ROUTES.auth.register,
]