<template>
  <div class="h-full bg-primary overflow-hidden">
    <div class="h-full overflow-y-auto">
      <div class="container mx-auto px-4 py-6">
        <!-- Breadcrumb -->
        <nav class="text-sm text-secondary mb-6">
          <NuxtLink to="/" class="hover:text-primary cursor-pointer"
            >{{ $t('products.title') }}</NuxtLink
          >
          <span class="mx-2">/</span>
          <span class="text-primary font-medium">{{
            product?.title || $t('product.product')
          }}</span>
        </nav>

        <!-- Loading State -->
        <div v-if="loading" class="flex-center py-20">
          <div
            class="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"
          ></div>
        </div>

        <!-- Product Details -->
        <div
          v-else-if="product && product.id"
          class="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="bg-secondary rounded-lg p-4 shadow-sm">
              <img
                :src="selectedImage"
                :alt="product.title"
                class="w-full h-96 object-contain rounded-lg"
              />
            </div>

            <div
              v-if="product.images && product.images.length > 1"
              class="flex gap-3 overflow-x-auto"
            >
              <div
                v-for="(image, index) in product.images"
                :key="`thumb-${index}`"
                @click="selectedImage = image"
                :class="[
                  'flex-shrink-0 w-20 h-20 bg-secondary rounded-lg p-2 cursor-pointer border-2 transition-colors',
                  selectedImage === image
                    ? 'border-theme'
                    : 'border-transparent hover:border-gray-300',
                ]"
              >
                <img
                  :src="image"
                  :alt="`${product.title} ${index + 1}`"
                  class="w-full h-full object-contain rounded"
                />
              </div>
            </div>
          </div>

          <!-- Right Side  -->
          <div class="space-y-4">
            <h1 class="text-2xl font-bold text-primary leading-tight">
              {{ product.title }}
            </h1>

            <div v-if="product.rating" class="flex items-center ">
              <div class="flex text-yellow-400">
                <span v-for="i in 5" :key="`star-${i}`" class="text-base">
                  {{ i <= Math.floor(product.rating) ? "★" : "☆" }}
                </span>
              </div>
              <span class="text-primary font-medium text-sm"
                >{{ product.rating.toFixed(1) }}/5.0</span
              >
              <span class="text-blue-600 text-sm underline cursor-pointer"
                >({{ product.reviews?.length || 0 }} {{ $t('product.reviews') }})</span
              >
            </div>

            <div v-if="product.price" >
              <div class="text-3xl font-bold text-primary">
                ₹{{ product.price.toFixed(2) }}
              </div>
            </div>

            <div>
              <span
                :class="[
                  'text-sm font-medium px-2 py-1 rounded',
                  product.stock > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{
                  product.availabilityStatus ||
                  (product.stock > 0 ? $t('product.inStock') : $t('product.outOfStock'))
                }}
              </span>
              <span v-if="product.stock" class="text-secondary text-sm ml-2">
                ({{ product.stock }} {{ $t('product.itemsAvailable') }})
              </span>
            </div>

            <div v-if="product.stock > 0" class="flex items-center gap-3">
              <span class="text-secondary text-sm">{{ $t('product.quantity') }}:</span>
              <div class="flex items-center gap-2">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="w-8 h-8 flex-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-primary font-semibold"
                >
                  -
                </button>
                <span class="w-12 text-center font-medium text-primary">{{
                  quantity
                }}</span>
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= product.stock"
                  class="w-8 h-8 flex-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-primary font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            <div class="border-t border-b border-gray-200 py-4">
              <h3 class="font-medium text-primary text-base mb-3">
                {{ $t('product.description') }}
              </h3>

              <div class="text-secondary text-sm leading-relaxed">
                <p>{{ product.description }}</p>
              </div>
            </div>

            <div v-if="product.stock > 0" class="flex gap-3 pt-4">
              <UButton
              @click="addToCart"
              :disabled="isAddingToCart"
              :loading="isAddingToCart"
              color="primary"
              size="lg"
              block
              class="py-3"
            >
              {{ isAddingToCart ? $t('product.adding') : $t('products.addToCart') }}
            </UButton>
            </div>

            <!-- Out of Stock Message -->
            <div v-else class="pt-4">
              <div
                class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
              >
                <p class="text-red-600 font-medium">
                  {{ $t('product.outOfStockMessage') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Product Found -->
        <div v-else class="flex-col-center py-20">
          <h2 class="text-xl font-semibold text-primary mb-2">
            {{ $t('product.notFound') }}
          </h2>
          <p class="text-secondary">
            {{ $t('product.notFoundMessage') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const { t } = useI18n()

// Props
const props = defineProps({
  product: {
    type: Object,
    default: () => null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["retry", "add-to-cart", "buy-now"]);

// Component state
const selectedImage = ref("");
const quantity = ref(1);
const isAddingToCart = ref(false);

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      selectedImage.value =
        newProduct.thumbnail || newProduct.images?.[0] || "";
      // Reset quantity to 1 when product changes
      quantity.value = 1;
    }
  },
  { immediate: true }
);

const increaseQuantity = () => {
  if (quantity.value < props.product.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = () => {
  if (quantity.value >= 1 && quantity.value <= props.product.stock) {
    isAddingToCart.value = true;

    // Reset loading state after 1 second
    setTimeout(() => {
      isAddingToCart.value = false;
      emit("add-to-cart", {
        product: props.product,
        quantity: quantity.value,
      });
    }, 1000);
  }
};
</script>