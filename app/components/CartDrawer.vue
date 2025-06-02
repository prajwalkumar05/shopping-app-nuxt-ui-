<template>
  <div>
    <!-- Cart Button -->
    <USlideover
      v-model="cartStore.isOpen"
      side="right"
      :ui="{
        body: 'bg-primary',
        background: 'bg-primary',
      }"
    >
      <UButton
        icon="i-heroicons-shopping-cart"
        variant="ghost"
        class="relative mr-medium"
        @click="cartStore.toggleCart()"
      >
        Cart
        <UBadge
          v-if="cartStore.totalItems > 0"
          :label="cartStore.totalItems.toString()"
          color="tertiary"
          class="absolute -top-1 -right-1 min-w-5 h-5 flex-center text-xs"
        />
      </UButton>

      <template #body>
        <div class="flex flex-col h-full">
          <div class="flex-between py-2 border-b">
            <div class="flex">
              <h2 class="text-xl text-primary font-semibold">My Cart</h2>
              <p class="text-sm text-primary">({{ cartStore.totalItems }})</p>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <!-- Cart Items -->
            <div v-if="cartStore.items.length > 0" class="space-y-4">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex-shrink-0">
                  <img
                    :src="item.thumbnail"
                    :alt="item.title"
                    class="w-16 h-16 object-cover rounded-md"
                  />
                </div>

                <div class="flex-1 space-y-2">
                  <div class="flex-between">
                    <h3
                      class="font-medium text-primary text-sm leading-tight line-clamp-2"
                    >
                      {{ item.title }}
                    </h3>
                    <UButton
                      icon="i-heroicons-trash"
                      size="2xs"
                      color="red"
                      class="text-primary"
                      square
                      @click="cartStore.removeItem(item.id)"
                    />
                  </div>

                  <div class="flex-between">
                    <p class="text-sm text-primary capitalize">
                      {{ item.category }}
                    </p>
                  </div>

                  <div class="flex-between">
                    <div class="flex-center gap-2">
                      <UButton
                        icon="i-heroicons-minus"
                        size="2xs"
                        variant="outline"
                        square
                        class="border-black text-primary hover:bg-black hover:text-white"
                        @click="
                          cartStore.updateQuantity(item.id, item.quantity - 1)
                        "
                      />
                      <span
                        class="text-sm text-primary font-medium w-8 text-center"
                        >{{ item.quantity }}</span
                      >
                      <UButton
                        icon="i-heroicons-plus"
                        size="2xs"
                        variant="outline"
                        square
                        class="border-black text-primary hover:bg-black hover:text-white"
                        @click="
                          cartStore.updateQuantity(item.id, item.quantity + 1)
                        "
                      />
                    </div>

                    <div class="text-right">
                      <p class="font-semibold text-primary">
                        ₹{{ (item.price * item.quantity).toFixed(2) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Cart -->
            <div v-else class="flex-col-center py-12">
              <UIcon
                name="i-heroicons-shopping-cart"
                class="w-16 h-16 text-primary mx-auto mb-4"
              />
              <h3 class="text-lg font-medium text-primary mb-2">
                Your cart is empty
              </h3>
              <p class="text-primary text-sm mb-6">
                Add some items to get started
              </p>
              <UButton
                label="Continue Shopping"
                class="btn-theme-primary"
                @click="cartStore.setCartOpen(false)"
              />
            </div>
          </div>

          <div v-if="cartStore.items.length > 0" class="border-t p-6 space-y-4">
            <!-- Total -->
            <div class="flex-between text-lg">
              <span class="font-semibold text-primary">Total:</span>
              <span class="font-bold text-primary"
                >₹{{ cartStore.totalPrice.toFixed(2) }}</span
              >
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { onMounted, onUnmounted } from "vue";

const cartStore = useCartStore();

const viewCart = () => {
  cartStore.setCartOpen(false);
};

const checkout = () => {
  cartStore.setCartOpen(false);
};
</script>