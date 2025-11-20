<template>
  <!-- <UButton active color="success" variant="outline"> Button </UButton>
  <UButton active color="error" variant="solid"> Button </UButton> -->
  <div class="h-full flex flex-col">
    <div class="flex justify-center bg-primary">
      <div class="w-full max-w-[1200px] px-4 ">
        <h1 class="text-2xl text-primary font-bold">Products List</h1>
      </div>
    </div>

    <div class="flex-1 flex justify-center overflow-hidden bg-primary">
      <div class="w-full max-w-[1200px] px-4 flex flex-col">
        <div v-if="loading" class="flex-1 flex justify-center items-center">
          <div
            class="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"
          ></div>
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- Products Grid Container -->
          <div class="flex-1 overflow-y-auto">
            <div class="relative min-h-full">
              <div class="py-4">
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

                <div v-else class="flex items-center justify-center py-20">
                  <div class="text-center">
                    <h2 class="text-xl font-semibold text-primary mb-2">
                      No Products Found
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="py-2 border-t bg-primary">
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
import { definePageMeta } from "#imports";
import { ref, onMounted } from "vue";
import { useProducts } from "~/composables/useProducts";

definePageMeta({
  layout: "default",
});

const { products, loading, error, currentPage, totalPages, fetchProducts } =
  useProducts();
const productsPerPage = 12;

const loadProducts = () => {
  fetchProducts(currentPage.value, productsPerPage);
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchProducts(page, productsPerPage);
};

onMounted(() => {
  loadProducts();
});
</script>
