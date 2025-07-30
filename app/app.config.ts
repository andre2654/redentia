export default defineAppConfig({
  ui: {
    colors: {
      primary: '#1a202c',
      secondary: '#a7d6ff',
      tertiary: '#042f54'
    },
  },
  input: {
    default: {
      color: 'primary',
      variant: 'outline',
      size: 'md',
    },
    slots: {
      root: 'dark',
    }
  }
})
