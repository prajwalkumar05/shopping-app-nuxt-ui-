// ~/constants/routes.js

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
    productsList:'/products',
    details: '/products/[id]'
  }
}

// Dynamic route 
export const DYNAMIC_ROUTES = {
  products :{
    productDetails: (id) => `/products/${id}`
  }
}

// Public routes 
export const PUBLIC_ROUTES = [
  ROUTES.auth.login,
  ROUTES.auth.register,
]

