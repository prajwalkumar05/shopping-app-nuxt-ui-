import { getApiBaseUrl } from '../config'

export const getProductsApi = (limit = 12, skip = 0) => {
  return `${getApiBaseUrl()}/products?limit=${limit}&skip=${skip}&select=id,title,price,thumbnail,category,rating,description`
}

export const getProductByIdApi = (productId) => {
  return `${getApiBaseUrl()}/products/${productId}`
}