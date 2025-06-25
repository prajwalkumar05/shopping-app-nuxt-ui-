<template>
  <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
    <span v-if="!isCollapsed" class="text-white text-sm font-medium">Dark Mode</span>
    
    <ClientOnly>
      <USwitch 
        v-model="isDark" 
        size="md"
        color="primary"
        unchecked-icon="i-lucide-sun"
        checked-icon="i-lucide-moon"
        :ui="{
          inactive: 'bg-white/20 border-white/30',
          active: 'bg-theme',
          thumb: {
            base: 'bg-white shadow-sm transition-all duration-300',
            active: 'bg-gray-800',
            inactive: 'bg-white'
          },
          icon: {
            base: 'w-3 h-3',
            active: 'text-yellow-400',
            inactive: 'text-orange-400'
          }
        }"
        @update:model-value="toggleTheme"
      />
      
    </ClientOnly>
  </div>
</template>

<script setup>
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const colorMode = useColorMode()
const toast = useToast()

// Initialize with server-safe default
const isDark = ref(false)

// Only update after client hydration
onMounted(() => {
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    isDark.value = colorMode.value === 'dark'
  })
})

// Watch for external colorMode changes (after hydration)
watch(() => colorMode.value, (newMode) => {
  if (process.client) {
    isDark.value = newMode === 'dark'
  }
})

// Toggle theme function
const toggleTheme = (value) => {
  const newTheme = value ? 'dark' : 'light'
  
  try {
    colorMode.preference = newTheme
    
    toast.add({
      title: 'Theme changed',
      description: `Switched to ${newTheme} mode`,
      icon: newTheme === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun',
      color: 'green',
      timeout: 2000
    })
  } catch (error) {
    console.error('Theme change failed:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to change theme',
      icon: 'i-lucide-alert-circle',
      color: 'red',
      timeout: 3000
    })
  }
}
</script>
