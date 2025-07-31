function showNotification(type: 'success' | 'error' | 'info', title: string, description: string) {
  const toast = useToast()

  const icon = {
    success: 'i-heroicons-check-circle-solid',
    error: 'i-heroicons-x-circle-solid',
    info: 'i-heroicons-information-circle-solid'
  }

  toast.add({
    color: type,
    icon: icon[type],
    title,
    description,
    progress: false,
    duration: 6000,
    ui: {
      root: `bg-black border border-${type}`,
      title: 'text-[15px] font-semibold text-white !py-0',
      description: 'text-[12px] font-regular text-white/80',
    }
  })
}

export function showSuccessNotification(title: string, description: string) {
  showNotification('success', title, description)
}