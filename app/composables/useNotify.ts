/**
 * useNotify — brand-aware toast helpers wrapping @nuxt/ui's `useToast`.
 *
 * The previous version hard-coded `bg-black border-${type}` which:
 *   1. Looked wrong on light-mode tenants (a black brick over the
 *      cream background).
 *   2. Didn't respect the brand palette at all.
 *
 * Now we drive every visual through CSS vars from `plugins/brand.ts`
 * + `color-mix()` so a tenant swap re-tints toasts automatically.
 *
 * Public API stays the same so callers don't need to migrate:
 *   - showSuccessNotification(title, description)
 *   - showErrorNotification(title, description)
 *   - showInfoNotification(title, description)
 */
type ToastType = 'success' | 'error' | 'info'

const ICONS: Record<ToastType, string> = {
  success: 'i-lucide-check-circle-2',
  error: 'i-lucide-alert-circle',
  info: 'i-lucide-info',
}

/**
 * Returns the CSS var name that matches the toast type's accent
 * color. Success → positive, error → negative, info → primary.
 * Falls through to `--brand-primary` so an unsupported type still
 * renders something readable.
 */
function accentVar(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'var(--brand-positive, #0AAE7C)'
    case 'error':
      return 'var(--brand-negative, #E0353D)'
    case 'info':
      return 'var(--brand-primary, #FACC15)'
  }
}

function showNotification(
  type: ToastType,
  title: string,
  description?: string,
  opts: { duration?: number } = {},
) {
  const toast = useToast()
  const accent = accentVar(type)

  toast.add({
    icon: ICONS[type],
    title,
    description,
    progress: false,
    duration: opts.duration ?? 5000,
    // Per-instance ui slot — Tailwind class on `root` plus inline style
    // for the brand-driven color-mixed fills (color-mix expressions
    // can't live inside Tailwind class strings reliably).
    ui: {
      root: 'redentia-toast group/redentia-toast pointer-events-auto',
      icon: 'redentia-toast-icon',
      title: 'redentia-toast-title',
      description: 'redentia-toast-desc',
      close: 'redentia-toast-close',
    },
    // CSS custom properties on the host let us drive a single
    // stylesheet from the brand vars. Unwrapped via [style.--accent]
    // selector in the global toast stylesheet (see plugins/brand.ts).
    style: `--redentia-toast-accent: ${accent};`,
  } as Parameters<typeof toast.add>[0])
}

export function showSuccessNotification(title: string, description?: string) {
  showNotification('success', title, description)
}

export function showErrorNotification(title: string, description?: string) {
  showNotification('error', title, description)
}

export function showInfoNotification(title: string, description?: string) {
  showNotification('info', title, description)
}
