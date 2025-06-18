<template>
  <div class="flex-between px-12 z-[1000]">
    <div class="pages-title">
      <h1 class="font-bold text-white">{{ appName }}</h1>
    </div>

    <UNavigationMenu :items="items" class="flex-center flex-1 z-[1000]" />

    <div class="flex-center">
       <LangSwitcher />
      <CartDrawer />
      <UButton
        icon="i-lucide-log-out"
        color="primary"
        variant="ghost"
        @click="isLogoutModalOpen = true"
      >
        Logout
      </UButton>
    </div>

    <!-- UModal Logout Confirmation -->
    <ConfirmModal
      :is-open="isLogoutModalOpen"
      title="Confirm Logout"
      message="Are you sure you want to logout?"
      confirm-text="Logout"
      icon="i-lucide-log-out"
      :loading="isLoggingOut"
      @confirm="handleLogout"
      @cancel="isLogoutModalOpen = false"
    >
    </ConfirmModal>
  </div>
</template>

<script setup>
import { ref } from "vue";

const { appName } = useRuntimeConfig().public

// 🔥 FIX: Use useAuthEnhanced instead of useAuth
const { loggedIn, user, logout } = useAuthEnhanced()
const isLogoutModalOpen = ref(false);
const isLoggingOut = ref(false);

const items = ref([
  {
    label: "Men",
    icon: "i-lucide-user",
    to: "/men",
    children: [
      {
        label: "Clothing",
        description: "Latest fashion trends for men",
        icon: "i-lucide-shirt",
        children: [
          {
            label: "T-Shirts",
            description: "Casual and formal t-shirts",
            to: "/",
          },
          {
            label: "Shirts",
            description: "Dress and casual shirts",
            to: "/",
          },
          {
            label: "Jeans",
            description: "Denim jeans and pants",
            to: "/",
          },
          {
            label: "Jackets",
            description: "Outerwear and blazers",
            to: "/men/clothing/jackets",
          },
        ],
      },
      {
        label: "Footwear",
        description: "Shoes for every occasion",
        icon: "i-lucide-footprints",
        children: [
          {
            label: "Sneakers",
            description: "Sports and casual sneakers",
            to: "/men/footwear/sneakers",
          },
          {
            label: "Formal Shoes",
            description: "Business and dress shoes",
            to: "/men/footwear/formal",
          },
          {
            label: "Boots",
            description: "Casual and work boots",
            to: "/men/footwear/boots",
          },
        ],
      },
      {
        label: "Accessories",
        icon: "i-lucide-watch",
        description: "Complete your look",
        children: [
          {
            label: "Watches",
            description: "Luxury and casual watches",
            to: "/men/accessories/watches",
          },
          {
            label: "Wallets",
            description: "Leather and fabric wallets",
            to: "/men/accessories/wallets",
          },
          {
            label: "Belts",
            description: "Casual and formal belts",
            to: "/men/accessories/belts",
          },
        ],
      },
    ],
  },
  {
    label: "Women",
    icon: "i-lucide-user",
    to: "/women",
    children: [
      {
        label: "Clothing",
        description: "Trendy fashion for women",
        icon: "i-lucide-shirt",
        children: [
          {
            label: "Dresses",
            description: "Casual and party dresses",
            to: "/women/clothing/dresses",
          },
          {
            label: "Tops",
            description: "Blouses, t-shirts and tanks",
            to: "/women/clothing/tops",
          },
          {
            label: "Jeans",
            description: "Skinny, straight and bootcut",
            to: "/women/clothing/jeans",
          },
          {
            label: "Skirts",
            description: "Mini, midi and maxi skirts",
            to: "/women/clothing/skirts",
          },
        ],
      },
      {
        label: "Footwear",
        description: "Stylish shoes for women",
        icon: "i-lucide-footprints",
        children: [
          {
            label: "Heels",
            description: "High heels and pumps",
            to: "/women/footwear/heels",
          },
          {
            label: "Flats",
            description: "Comfortable everyday shoes",
            to: "/women/footwear/flats",
          },
          {
            label: "Sneakers",
            description: "Athletic and casual sneakers",
            to: "/women/footwear/sneakers",
          },
          {
            label: "Boots",
            description: "Ankle and knee-high boots",
            to: "/women/footwear/boots",
          },
        ],
      },
      {
        label: "Accessories",
        icon: "i-lucide-gem",
        description: "Beautiful accessories",
        children: [
          {
            label: "Jewelry",
            description: "Necklaces, earrings and bracelets",
            to: "/women/accessories/jewelry",
          },
          {
            label: "Handbags",
            description: "Purses, totes and clutches",
            to: "/women/accessories/handbags",
          },
          {
            label: "Scarves",
            description: "Silk and cotton scarves",
            to: "/women/accessories/scarves",
          },
        ],
      },
    ],
  },
  {
    label: "Electronics",
    icon: "i-lucide-smartphone",
    to: "/electronics",
    children: [
      {
        label: "Smartphones",
        description: "Latest mobile phones",
        icon: "i-lucide-smartphone",
        children: [
          {
            label: "iPhone",
            description: "Apple smartphones",
            to: "/electronics/smartphones/iphone",
          },
          {
            label: "Samsung",
            description: "Samsung Galaxy series",
            to: "/electronics/smartphones/samsung",
          },
          {
            label: "Android",
            description: "Various Android phones",
            to: "/electronics/smartphones/android",
          },
        ],
      },
      {
        label: "Laptops",
        description: "Computers and laptops",
        icon: "i-lucide-laptop",
        children: [
          {
            label: "Gaming Laptops",
            description: "High-performance gaming",
            to: "/electronics/laptops/gaming",
          },
          {
            label: "Business Laptops",
            description: "Professional workstations",
            to: "/electronics/laptops/business",
          },
          {
            label: "Ultrabooks",
            description: "Thin and light laptops",
            to: "/electronics/laptops/ultrabooks",
          },
        ],
      },
      {
        label: "Audio",
        description: "Headphones and speakers",
        icon: "i-lucide-headphones",
        children: [
          {
            label: "Headphones",
            description: "Over-ear and on-ear",
            to: "/electronics/audio/headphones",
          },
          {
            label: "Earbuds",
            description: "Wireless and wired earbuds",
            to: "/electronics/audio/earbuds",
          },
          {
            label: "Speakers",
            description: "Bluetooth and home speakers",
            to: "/electronics/audio/speakers",
          },
        ],
      },
      {
        label: "Gaming",
        description: "Gaming consoles and accessories",
        icon: "i-lucide-gamepad-2",
        children: [
          {
            label: "Consoles",
            description: "PlayStation, Xbox, Nintendo",
            to: "/electronics/gaming/consoles",
          },
          {
            label: "Games",
            description: "Latest video games",
            to: "/electronics/gaming/games",
          },
          {
            label: "Accessories",
            description: "Controllers and peripherals",
            to: "/electronics/gaming/accessories",
          },
        ],
      },
    ],
  },
  {
    label: "Sale",
    icon: "i-lucide-tag",
    badge: "Hot",
    to: "/sale",
    children: [
      {
        label: "Flash Sale",
        description: "Limited time offers",
        icon: "i-lucide-zap",
        to: "/sale/flash",
      },
      {
        label: "Clearance",
        description: "Final sale items",
        icon: "i-lucide-percent",
        to: "/sale/clearance",
      },
      {
        label: "Bundle Deals",
        description: "Buy more, save more",
        icon: "i-lucide-package",
        to: "/sale/bundles",
      },
    ],
  },
]);

// 🔥 FIX: Updated logout handler to use async/await properly
const handleLogout = async () => {
  try {
    isLoggingOut.value = true;
    
    // 🔥 FIX: Wait for logout to complete
    await logout('manual')
    
    // Close the modal
    isLogoutModalOpen.value = false;

    // Show success toast
    const toast = useToast();
    toast.add({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Show error toast
    const toast = useToast();
    toast.add({
      title: "Logout failed",
      description: "There was an error logging out. Please try again.",
      color: "error",
      icon: "i-lucide-x-circle",
    });
  } finally {
    isLoggingOut.value = false;
  }
};
</script>