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
        Free Shipping
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
          ₹{{ product.originalPrice }}
        </span>
        <span class="text-lg font-semibold text-black">
          ₹{{ product.price }}
        </span>
      </div>

      <div class="flex-between gap-2">
        <UButton
          size="sm"
          color="primary"
          label="View Details"
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
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { ref } from "vue";
import { navigateTo } from "#app";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();
const isWishlisted = ref(false);
const addingToCart = ref(false);

const addToCart = async () => {
  try {
    addingToCart.value = true;


    // Add 2-second loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    cartStore.addItem(props.product);
    const toast = useToast();
    toast.add({
      title: "Added to cart",
      description: `${props.product.title} has been added to your cart`,
      icon: "i-heroicons-check-circle",
      color: "green",
    });
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to add item to cart",
      icon: "i-heroicons-x-circle",
      color: "red",
    });
  } finally {
    addingToCart.value = false;
  }
};

const viewProduct = () => {
  navigateTo(`/products/${props.product.id}`);
};
</script>
