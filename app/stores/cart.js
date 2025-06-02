import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useCartStore = defineStore(
  "cart",
  () => {
    const items = ref([])
    const isOpen = ref(false)

    const addItem = (product, quantity = 1) => {
      const existingItem = items.value.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        items.value.push({
          ...product,
          quantity,
        })
      }
    }

    const removeItem = (productId) => {
      const index = items.value.findIndex((item) => item.id === productId)
      if (index > -1) {
        items.value.splice(index, 1)
      }
    }

    const updateQuantity = (productId, quantity) => {
      const item = items.value.find((item) => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          removeItem(productId)
        } else {
          item.quantity = quantity
        }
      }
    }

    const clearCart = () => {
      items.value = []
    }

    const toggleCart = () => {
      isOpen.value = !isOpen.value
    }

    const setCartOpen = (open) => {
      isOpen.value = open
    }

    const totalItems = computed(() => {
      return items.value.reduce((total, item) => total + item.quantity, 0)
    })

    const totalPrice = computed(() => {
      return items.value.reduce((total, item) => total + item.price * item.quantity, 0)
    })

    return {
      items,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      setCartOpen,
      totalItems,
      totalPrice,
    }
  },
  {
    persist: true,
  },
)
