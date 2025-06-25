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
  
  // Theme configuration for your ColorPicker
  themes: {
    teal: {
      name: 'Teal',
      color: 'teal',
      primary: '#086972'
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