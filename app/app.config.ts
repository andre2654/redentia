export default defineAppConfig({
  ui: {
    colors: {
      primary: '#1a202c',
      secondary: '#a7d6ff',
      tertiary: '#042f54',
      colorBackground: '#fff',
    },
    avatar: {
      slots: {
        root: 'rounded-[6px] bg-[#D9D9D9]',
        fallback: 'text-black'
      }
    }
  }
})
