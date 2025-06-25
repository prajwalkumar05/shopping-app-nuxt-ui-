<!-- components/ColorPicker.vue -->
<template>
  <div class="relative">
    <UButton
      :icon="isCollapsed ? 'i-heroicons-swatch' : undefined"
      :label="isCollapsed ? undefined : 'Theme Color'"
      color="white"
      variant="ghost"
      size="sm"
      class="w-full justify-start text-white hover:bg-white/10"
      @click="toggleDropdown"
    >
      <template #leading v-if="!isCollapsed">
        <UIcon name="i-heroicons-swatch" class="w-4 h-4" />
      </template>
      
      <template #trailing v-if="!isCollapsed">
        <div class="flex items-center gap-2">
          <div 
            class="w-3 h-3 rounded-full border border-white/30 transition-colors duration-300"
            :style="{ backgroundColor: currentTheme.primary }"
          />
          <UIcon 
            name="i-heroicons-chevron-down" 
            class="w-3 h-3 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </div>
      </template>
    </UButton>

    <!-- Enhanced Dropdown Content -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="isOpen"
        class="absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[220px]"
        :class="isCollapsed ? 'left-16' : 'left-0'"
      >
        <!-- Header -->
        <div class="mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Choose Theme Color
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Current: {{ currentTheme.name }}
          </p>
        </div>
        
        <!-- Color Options Grid -->
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="theme in themeOptions"
            :key="theme.key"
            @click="handleThemeChange(theme.key)"
            class="flex items-center gap-2 p-2 rounded-md text-left transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 group"
            :class="isCurrentTheme(theme.key) ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-gray-300 dark:ring-gray-600' : ''"
          >
            <!-- Color Circle with Animation -->
            <div 
              class="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 transition-all duration-200 group-hover:scale-110"
              :style="{ backgroundColor: theme.primary }"
              :class="isCurrentTheme(theme.key) ? 'scale-110 border-gray-400 dark:border-gray-500' : ''"
            />
            
            <!-- Theme Name -->
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 block truncate">
                {{ theme.label }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 block truncate">
                {{ theme.primary }}
              </span>
            </div>
            
            <!-- Current Indicator -->
            <UIcon 
              v-if="isCurrentTheme(theme.key)"
              name="i-heroicons-check" 
              class="w-4 h-4 text-green-500 transition-all duration-200"
            />
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Applied globally
            </p>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <span class="text-xs text-green-600 dark:text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black/10"
        @click="closeDropdown"
      />
    </Transition>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

// Composables
const toast = useToast()
const { currentTheme, themeOptions, setTheme, isCurrentTheme } = useAppTheme()

// State
const isOpen = ref(false)

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleThemeChange = (themeKey) => {
  const success = setTheme(themeKey)
  
  if (success) {
    const theme = themeOptions.value.find(t => t.key === themeKey)
    toast.add({
      title: 'Theme Updated',
      description: `Switched to ${theme.label} theme`,
      icon: 'i-heroicons-check-circle',
      color: 'green',
      timeout: 2000
    })
  }

  closeDropdown()
}

</script>