<template>
  <div class="min-h-screen bg-[#e9ecef]">
    <Navbar />

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";
import { onMounted } from "vue";

const authStore = useAuthStore();

onMounted(() => {
  authStore.initializeAuth();
});
</script>

<style>
body {
  font-family: "Inter", sans-serif;
}
</style>
