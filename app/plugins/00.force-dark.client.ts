export default defineNuxtPlugin({
  name: 'force-dark-mode',
  // Run after all other plugins (including @nuxtjs/color-mode) so it can't be overwritten.
  enforce: 'post',
  setup(nuxtApp) {
    const colorMode = useColorMode()

    const forceDark = () => {
      if (colorMode.preference !== 'dark') {
        colorMode.preference = 'dark'
      }

      try {
        // Keep storage aligned with the configured key to prevent future light boots.
        localStorage.setItem('nuxt-color-mode-force', 'dark')
      } catch {
        // ignore (private mode / blocked storage)
      }

      // Hard enforce the html class.
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }

    // Apply immediately and again after mount (in case something runs late).
    forceDark()
    nuxtApp.hook('app:mounted', forceDark)

    // If anything tries to switch away from dark, revert it.
    watch(
      () => colorMode.preference,
      (pref) => {
        if (pref !== 'dark') forceDark()
      }
    )
    watch(
      () => colorMode.value,
      (val) => {
        if (val !== 'dark') forceDark()
      }
    )
  },
})


