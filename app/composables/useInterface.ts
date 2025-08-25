import { EColorTheme } from '~/enums/general'

export function useInterface() {
  const colorIcons = {
    [EColorTheme.Light]: 'i-lucide-sun',
    [EColorTheme.Dark]: 'i-lucide-moon',
    [EColorTheme.System]: 'majesticons-desktop-computer-line',
  }

  const colorLabels = {
    [EColorTheme.Light]: 'Tema atual: claro',
    [EColorTheme.Dark]: 'Tema atual: escuro',
    [EColorTheme.System]: 'Tema atual: sistema (padrão)',
  }

  const colorTheme = computed({
    get() {
      const currentTheme = useNuxtApp().$colorMode.preference as EColorTheme
      return {
        color: currentTheme,
        icon: colorIcons[currentTheme],
        label: colorLabels[currentTheme],
      }
    },
    set(theme: EColorTheme) {
      useNuxtApp().$colorMode.preference = theme
    },
  })

  return {
    colorIcons,
    colorLabels,
    colorTheme,
  }
}

