<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <Navbar />
    <main class="bg-[#F4F2EE] flex-1  overflow-hidden">
      <slot />
    </main>
    <UNotifications />
  </div>
</template>

<script setup>
</script>


<style scoped>
:deep(*::-webkit-scrollbar) {
  display: none;
}

</style>