<template>
  <div class="h-full flex flex-col">
    <!-- Header Section -->
    <div class="flex justify-center bg-primary">
      <div class="w-full max-w-[1200px] px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl text-primary font-bold">
            {{ $t("products.title") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex justify-center overflow-hidden bg-primary">
      <div class="w-full max-w-[1200px] px-4 flex flex-col">
        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex justify-center items-center">
          <div class="text-center">
            <div class="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
            <p class="text-primary">{{ $t("common.loading") }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex-1 flex justify-center items-center">
          <div class="text-center">
            <p class="text-red-600 mb-4">{{ $t("common.error") }}</p>
            <button 
              @click="loadProducts" 
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {{ $t("common.retry") }}
            </button>
          </div>
        </div>

        <!-- Products Content -->
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto">
            <div class="relative min-h-full">
              <div class="py-4">
                <!-- Products Grid -->
                <div
                  v-if="products.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
                >
                  <Card
                    v-for="product in products"
                    :key="product.id"
                    :product="product"
                  />
                </div>

                <!-- No Products State -->
                <div v-else class="flex items-center justify-center py-20">
                  <div class="text-center">
                    <div class="mb-4">
                      <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-7 7-7-7"></path>
                      </svg>
                    </div>
                    <h2 class="text-xl font-semibold text-primary mb-2">
                      {{ $t("products.noProducts") }}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="products.length > 0" class="py-2 border-t bg-primary">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports"
import { ref, onMounted } from "vue"
import { useProducts } from "~/composables/useProducts"

// Set page meta
definePageMeta({
  layout: "default",
})

// Composables
const { locale, setLocale, t } = useI18n()

const { products, loading, error, currentPage, totalPages, fetchProducts } = useProducts()

// Constants
const productsPerPage = 12

// Reactive data
const selectedLocale = ref(locale.value)

// Methods
const changeLanguage = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newLocale = target.value
  
  try {
    await setLocale(newLocale)
    selectedLocale.value = newLocale
    
    // Force reactivity update
    await nextTick()
    
    console.log('Language changed to:', newLocale)
  } catch (error) {
    console.error('Failed to change language:', error)
  }
}

const loadProducts = async () => {
  try {
    await fetchProducts(currentPage.value, productsPerPage)
  } catch (err) {
    console.error('Failed to load products:', err)
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchProducts(page, productsPerPage)
}

// Watch for locale changes
watch(locale, (newLocale) => {
  selectedLocale.value = newLocale
})

// Lifecycle
onMounted(() => {
  loadProducts()
})


</script>