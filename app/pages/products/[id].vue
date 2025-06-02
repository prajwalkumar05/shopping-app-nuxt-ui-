<template>
  <div class="h-[calc(100vh-3rem)] w-full max-w-[1200px] mx-auto">
    <ProductDetails 
      :product="product" 
      :loading="loading" 
      :error="error" 
      @retry="loadProduct"
      @add-to-cart="handleAddToCart"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

import { useProducts } from '~/composables/useProducts'  
import { useCartStore } from '~/stores/cart'
import { ref, onMounted } from 'vue'
import ProductDetails from '~/components/ProductDetails.vue'

const route = useRoute()
const toast = useToast()
const { fetchProductById } = useProducts()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)

const loadProduct = () => {
  loading.value = true
  error.value = null
  
  const productId = route.params.id
  if (!productId) {
    error.value = 'Product ID is missing'
    loading.value = false
    return
  }
  
  console.log('Loading product with ID:', productId)
  
  fetchProductById(productId)
    .then(productData => {
      if (!productData || !productData.id) {
        throw new Error('Product not found')
      }
      product.value = productData
    })
    .catch(err => {
      error.value = err.message
    })
    .finally(() => {
      loading.value = false
    })
}

const handleAddToCart = (data) => {
  console.log(data)
  
  cartStore.addItem(data.product, data.quantity)
  toast.add({
    title: 'Added to Cart!',
    description: `${data.product.title} (${data.quantity}x) added to your cart.`,
    icon: 'i-heroicons-shopping-cart',
    color: 'green',
    timeout: 3000
  })
}


// Load product on component mount
onMounted(() => {
  loadProduct()
})
</script>