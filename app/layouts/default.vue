<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <Navbar />
    <main class="bg-[#F4F2EE] flex-1  overflow-hidden">
      <p>v{{ config.public.APP_VERSION }}</p>
      <slot />
    </main>
    <UNotifications />
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
</script>


<style scoped>
:deep(*::-webkit-scrollbar) {
  display: none;
}

</style>