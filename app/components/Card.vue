<template>
  <div
    class="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200 relative group"
  >
    <div v-if="product.freeShipping" class="absolute top-2 left-2 z-10">
      <UBadge
        color="gray"
        variant="solid"
        size="xs"
        class="bg-gray-100 text-gray-700 px-2 py-1"
      >
        {{ $t('products.freeShipping') }}
      </UBadge>
    </div>

    <div
      class="aspect-square bg-gray-50 flex-center p-2 cursor-pointer"
      @click="viewProduct"
    >
      <img
        :src="product.thumbnail"
        :alt="product.title"
        class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
      />
    </div>

    <div class="p-4">
      <!-- Product Name -->
      <h3
        class="text-sm font-medium text-black mb-2 line-clamp-2 cursor-pointer"
        @click="viewProduct"
      >
        {{
          product.title.length > 15
            ? product.title.substring(0, 15) + "..."
            : product.title
        }}
      </h3>

      <div class="mb-2">
        <span
          v-if="product.originalPrice"
          class="text-sm text-gray-300 line-through"
        >
          {{ formatPrice(product.originalPrice) }}
        </span>
        <span class="text-lg font-semibold text-black">
          {{ formatPrice(product.price) }}
        </span>
      </div>

      <div class="flex-between gap-2">
        <UButton
          size="sm"
          color="primary"
          :label="$t('products.viewDetails')"
          class="btn-theme-primary"
          @click="viewProduct"
        />
        <UButton
          icon="i-heroicons-shopping-cart"
          size="sm"
          color="primary"
          variant="outline"
          class="btn-theme-outline"
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
import { ref } from "vue";
import { navigateTo } from "#app";

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
  // You can customize this based on locale
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

const viewProduct = () => {
  navigateTo(DYNAMIC_ROUTES.products.productDetails(props.product.id));
};
</script>