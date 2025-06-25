<template>
  <div class="h-full flex flex-col bg-primary transition-all duration-300">
    <!-- Header Section -->
    <div class="flex justify-center bg-primary ">
      <div class="w-full max-w-[1200px] px-4 py-2">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl text-theme font-bold">
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
            <div class="w-8 h-8 border-4 border-gray-200 dark:border-gray-600 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
            <p class="text-primary">{{ $t("common.loading") }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex-1 flex justify-center items-center">
          <div class="text-center">
            <p class="text-red-600 dark:text-red-400 mb-4">{{ $t("common.error") }}</p>
            <button 
              @click="loadProducts" 
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded transition-all duration-300"
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
                  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                >
                  <div
                    v-for="product in products"
                    :key="product.id"
                  >
                    <Card :product="product" />
                  </div>
                </div>

                <!-- No Products State -->
                <div v-else class="flex items-center justify-center py-20">
                  <div class="text-center">
                    <div class="mb-4">
                      <svg class="w-16 h-16 text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-7 7-7-7"></path>
                      </svg>
                    </div>
                    <h2 class="text-xl font-semibold text-primary mb-2">
                      {{ $t("products.noProducts") }}
                    </h2>
                    <p class="text-secondary">
                      No products available at the moment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="products.length > 0" class="py-2 border-t border-theme bg-primary">
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

<script setup>
import { definePageMeta } from "#imports"

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
const changeLanguage = async (event) => {
  const target = event.target
  const newLocale = target.value
  
  try {
    await setLocale(newLocale)
    selectedLocale.value = newLocale
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

const handlePageChange = async (page) => {
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