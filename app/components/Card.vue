<template>
  <div
    class="bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 relative group"
  >
    <!-- Free Shipping Badge -->
    <div v-if="product.freeShipping" class="absolute top-2 left-2 z-10">
      <UBadge
        color="gray"
        variant="solid"
        size="xs"
        class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 transition-colors duration-300"
      >
        {{ $t('products.freeShipping') }}
      </UBadge>
    </div>

    <!-- Product Image -->
    <div
      class="aspect-square bg-gray-50 dark:bg-gray-700 flex-center p-2 cursor-pointer transition-colors duration-300"
      @click="viewProduct"
    >
      <img
        :src="product.thumbnail"
        :alt="product.title"
        class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
      />
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Product Name -->
      <h3
        class="text-sm font-medium text-primary mb-2 line-clamp-2 cursor-pointer transition-colors duration-300"
        @click="viewProduct"
      >
        {{
          product.title.length > 15
            ? product.title.substring(0, 15) + "..."
            : product.title
        }}
      </h3>

      <!-- Product Price -->
      <div class="mb-2">
        <span
          v-if="product.originalPrice"
          class="text-sm text-muted line-through mr-2 transition-colors duration-300"
        >
          {{ formatPrice(product.originalPrice) }}
        </span>
        <span class="text-lg font-semibold text-primary transition-colors duration-300">
          {{ formatPrice(product.price) }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex-between gap-2">
        <UButton
          size="sm"
          color="primary"
          :label="$t('products.viewDetails')"
          @click="viewProduct"
        />
        <UButton
          icon="i-heroicons-shopping-cart"
          size="sm"
          color="primary"
          variant="outline"
          :loading="addingToCart"
          :disabled="addingToCart"
          @click="addToCart"
          :title="$t('products.addToCart')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { DYNAMIC_ROUTES } from '~/config/routes'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

// Composables
const { t } = useI18n()
const cartStore = useCartStore();
const toast = useToast();

// Reactive data
const isWishlisted = ref(false);
const addingToCart = ref(false);

// Methods
const formatPrice = (price) => {
  return `₹${price}`;
};

const addToCart = async () => {
  try {
    addingToCart.value = true;

    // Add 1-second loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    cartStore.addItem(props.product);
    
    toast.add({
      title: t('products.addedToCart'),
      description: t('products.addedToCartDesc', { product: props.product.title }),
      icon: "i-heroicons-check-circle",
      color: "green",
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    
    toast.add({
      title: t('common.error'),
      description: t('products.addToCartError'),
      icon: "i-heroicons-x-circle",
      color: "red",
    });
    
  } finally {
    addingToCart.value = false;
  }
};

const { locale } = useI18n()


const viewProduct = () => {
  navigateTo(DYNAMIC_ROUTES.products.productDetails(props.product.id, locale.value));
};
</script>

