<template>
  <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
    <span v-if="!isCollapsed" class="text-white text-sm font-medium">Dark Mode</span>
    
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

const isDark = ref(false)

const toggleTheme = (value) => {
  const newTheme = value ? 'dark' : 'light'
  colorMode.preference = newTheme
  
  toast.add({
    title: 'Theme changed',
    description: `Switched to ${newTheme} mode`,
    icon: newTheme === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun',
    color: 'green',
    timeout: 2000
  })
}

onMounted(() => {
  isDark.value = colorMode.value === 'dark'
})

// Watch for colorMode changes
watch(() => colorMode.value, (newMode) => {
  isDark.value = newMode === 'dark'
})


</script>