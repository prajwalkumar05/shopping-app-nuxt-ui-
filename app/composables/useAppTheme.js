// composables/useAppTheme.js
export const useAppTheme = () => {
  const themes = {
    green: { name: 'Green', primary: '#059669' },
    red: { name: 'Red', primary: '#f06595' },
    purple: { name: 'Purple', primary: '#845ef7' },
    blue: { name: 'Blue', primary: '#339af0' }
  }

  // Simple reactive state - no cookies
  const selectedTheme = ref('green')
  const currentTheme = computed(() => themes[selectedTheme.value])

  const setTheme = (theme) => {
    if (!themes[theme]) return false
    
    selectedTheme.value = theme
    
    if (process.client) {
      // Save to localStorage
      localStorage.setItem('app-theme', theme)
      
      // Update CSS custom properties immediately
      const primaryColor = themes[theme].primary
      document.documentElement.style.setProperty('--theme-primary', primaryColor)
      document.documentElement.style.setProperty('--ui-primary', primaryColor)
      document.documentElement.setAttribute('data-theme', theme)
      
      console.log(`Theme changed to: ${theme} (${primaryColor})`)
    }
    
    return true
  }

  const initTheme = () => {
    if (process.client) {
      // Get saved theme from localStorage, fallback to green
      const savedTheme = localStorage.getItem('app-theme') || 'green'
      
      // Validate theme exists
      if (themes[savedTheme]) {
        selectedTheme.value = savedTheme
        setTheme(savedTheme)
      } else {
        // Invalid theme in localStorage, reset to green
        setTheme('green')
      }
    }
  }

  const themeOptions = computed(() => 
    Object.entries(themes).map(([key, theme]) => ({
      key,
      label: theme.name,
      primary: theme.primary
    }))
  )

  // Initialize on mount
  onMounted(() => {
    initTheme()
  })

  return {
    selectedTheme: readonly(selectedTheme),
    currentTheme,
    themeOptions,
    setTheme,
    initTheme,
    isCurrentTheme: (theme) => selectedTheme.value === theme
  }
}