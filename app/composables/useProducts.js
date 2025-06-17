import { ref } from "vue"
import axios from "axios"
import { getProductsApi, getProductByIdApi } from "~/services/api/products/product"

export const useProducts = () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(0)

  const fetchProducts = (page = 1, limit = 12) => {
    loading.value = true
    error.value = null

    const skip = (page - 1) * limit
    
    return axios.get(getProductsApi(limit, skip))
    .then((response) => {
      const data = response.data
      
      products.value = data.products
      totalProducts.value = data.total
      totalPages.value = Math.ceil(data.total / limit)

      return products.value
    })
    .catch((err) => {
      error.value = "Failed to fetch products"
      throw new Error("Failed to fetch products")
    })
    .finally(() => {
      loading.value = false
    })
  }

  const fetchProductById = (id) => {
    loading.value = true
    error.value = null

    return axios.get(getProductByIdApi(id))
    .then((response) => {
      const product = response.data

      if (!product || !product.id) {
        throw new Error("Product not found")
      }

      return product
    })
    .catch((err) => {
      error.value = "Failed to fetch product"
      throw new Error("Failed to fetch product")
    })
    .finally(() => {
      loading.value = false
    })
  }

  return {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    fetchProducts,
    fetchProductById,
  }
}









































































































