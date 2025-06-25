// composables/useAppTheme.js
export const useAppTheme = () => {
  const themes = {
    teal: { name: 'Teal', primary: '#086972' },
    red: { name: 'Red', primary: '#f06595' },
    purple: { name: 'Purple', primary: '#845ef7' },
    blue: { name: 'Blue', primary: '#339af0' }
  }

  const selectedTheme = useCookie('app-theme', { default: () => 'teal' })
  const currentTheme = computed(() => themes[selectedTheme.value])

  const setTheme = (theme) => {
    selectedTheme.value = theme
    if (process.client) {
      document.documentElement.style.setProperty('--theme-primary', themes[theme].primary)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  const initTheme = () => {
    if (process.client) {
      setTheme(selectedTheme.value)
    }
  }

  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    key,
    label: theme.name,
    primary: theme.primary
  }))

  // Initialize on mount
  onMounted(initTheme)

  return {
    selectedTheme: readonly(selectedTheme),
    currentTheme,
    themeOptions,
    setTheme,
    initTheme,
    isCurrentTheme: (theme) => selectedTheme.value === theme
  }
}