export default defineNuxtPlugin(() => {
  // Ensure the app always starts in dark mode (avoid occasional light startup).
  const colorMode = useColorMode()
  if (colorMode.preference !== 'dark') colorMode.preference = 'dark'

  try {
    // Keep storage aligned with the configured key to prevent future light boots.
    localStorage.setItem('nuxt-color-mode-force', 'dark')
  } catch {
    // ignore (private mode / blocked storage)
  }

  // Hard enforce the html class.
  document.documentElement.classList.add('dark')
  document.documentElement.classList.remove('light')
})


