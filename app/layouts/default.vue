<!-- layouts/default.vue -->
<template>
  <div class="h-screen overflow-hidden bg-primary transition-all duration-300">
    <Navbar>
      <slot />
    </Navbar>
  </div>
</template>

<script setup>


</script>

<style scoped>
:deep(*::-webkit-scrollbar) {
  display: none;
}
</style>
