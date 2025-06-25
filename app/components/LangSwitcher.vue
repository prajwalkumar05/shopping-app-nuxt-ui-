<!-- components/LangSwitcher.vue -->
<template>
  <div class="relative">
    <UButton
      v-if="isCollapsed"
      :icon="getCurrentLanguageIcon()"
      color="white"
      variant="ghost"
      size="sm"
      class="w-full justify-center text-white hover:bg-white/10"
      @click="toggleDropdown"
    />

    <!-- Expanded State -->
    <div v-else class="space-y-2">
      <span v-if="showLabel" class="text-white text-xs font-medium opacity-70">Language</span>
      <div class="flex bg-white/10 rounded-lg p-0.5 gap-0.5">
        <button 
          v-for="lang in languages" 
          :key="lang.code" 
          :class="[
            'flex-1 px-2 py-1.5 rounded-md text-xs font-medium text-center transition-all duration-200 border-none cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis',
            currentLocale === lang.code
              ? 'bg-white/90 text-teal-700 shadow-sm'
              : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white/90'
          ]" 
          @click="switchLanguage(lang.code)"
        >
          {{ lang.label }}
        </button>
      </div>
    </div>

    <!-- collapsed state -->
    <div 
      v-if="isCollapsed && isOpen"
      class="absolute z-50 mt-2 left-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[180px]"
    >
      <!-- Header -->
      <div class="mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          Choose Language
        </h3>
      </div>
      
      <!-- Language Options -->
      <div class="space-y-1">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="handleLanguageChange(lang.code)"
          class="w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="currentLocale === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''"
        >
          <!-- Flag -->
          <span class="text-lg">{{ lang.flag }}</span>
          
          <!-- Language Name -->
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
            {{ lang.label }}
          </span>
          
          <!-- Current Indicator -->
          <UIcon 
            v-if="currentLocale === lang.code"
            name="i-heroicons-check" 
            class="w-4 h-4 text-green-500"
          />
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          Language applied globally
        </p>
      </div>
    </div>

    <!-- Backdrop for collapsed dropdown -->
    <div 
      v-if="isCollapsed && isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    />
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

// Composables
const { locale, setLocale } = useI18n()
const currentLocale = computed(() => locale.value)

// State for dropdown
const isOpen = ref(false)

// Language options 
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' }
]

// Methods
const getCurrentLanguageIcon = () => {
  const currentLang = languages.find(lang => lang.code === currentLocale.value)
  // Return a globe icon as fallback, since we're using emoji flags
  return 'i-heroicons-globe-alt'
}

const toggleDropdown = () => {
  if (props.isCollapsed) {
    isOpen.value = !isOpen.value
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const switchLanguage = (langCode) => {
  setLocale(langCode)
  showToast(langCode)
}

const handleLanguageChange = (langCode) => {
  switchLanguage(langCode)
  closeDropdown()
}

const showToast = (langCode) => {
  try {
    const toast = useToast()
    toast.clear()
    const selectedLang = languages.find(lang => lang.code === langCode)

    toast.add({
      title: "Language Changed",
      description: `Language switched to ${selectedLang?.label}`,
      icon: "i-lucide-globe",
      color: "success",
      timeout: 2000
    })
  } catch (error) {
    console.log('Language changed to:', langCode)
  }
}
</script>