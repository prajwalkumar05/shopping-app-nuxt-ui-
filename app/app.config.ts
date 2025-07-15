import { customTheme } from '~/assets/css/theme/index.js'

export default defineAppConfig({
  ui: {
    ...customTheme,
    colors: {
      primary: 'custom-primary',
      secondary: 'custom-theme',
      success: 'green',
      info: 'blue',
      warning: 'orange',
      error: 'red'
    }
  },
  
  // Theme configuration - Updated with Green as default
  themes: {
    green: {
      name: 'Green',
      color: 'green',
      primary: '#059669'
    },
    red: {
      name: 'Red',
      color: 'red', 
      primary: '#f06595'
    },
    purple: {
      name: 'Purple',
      color: 'purple',
      primary: '#845ef7'
    },
    blue: {
      name: 'Blue',
      color: 'blue',
      primary: '#339af0'
    }
  }
} as any)