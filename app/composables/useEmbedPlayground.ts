/**
 * Composable compartilhado para embeds.
 * Gerencia:
 *  - Detecção de modo widget (`?widget=1`) vs playground
 *  - Geração da URL iframe (usa o domínio principal + prefix /embed)
 *  - Copy-to-clipboard do código iframe
 *
 * NOTA: antes usávamos um subdomínio embed.redentia.com.br, mas esse
 * subdomínio nunca foi configurado no DNS/Nginx. Agora usamos o domínio
 * principal com prefix /embed, que funciona sem ops adicional.
 */

interface EmbedPlaygroundOptions {
  /** Path do embed, ex: '/ticker/small', '/carousel' (com ou sem prefix /embed) */
  path: string
  /** Dimensões default do iframe */
  width: number
  height: number
  /** Query params para montar a URL do iframe */
  params: Ref<Record<string, string>>
  /** Título da iframe (acessibilidade) */
  title: Ref<string>
}

export function useEmbedPlayground(options: EmbedPlaygroundOptions) {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const brand = useBrand()

  const isWidgetMode = computed(() => route.query.widget === '1')

  const embedOrigin = computed(() => {
    const raw = String(runtimeConfig.public?.siteUrl || brand.url || '').replace(/\/$/, '')
    return raw
  })

  const embedUrl = computed(() => {
    const merged = { ...options.params.value, widget: '1' }
    const qs = new URLSearchParams(merged).toString()
    const normalizedPath = options.path.startsWith('/') ? options.path : `/${options.path}`
    const fullPath = normalizedPath.startsWith('/embed/') ? normalizedPath : `/embed${normalizedPath}`
    return `${embedOrigin.value}${fullPath}?${qs}`
  })

  const iframeCode = computed(
    () => `<iframe src="${embedUrl.value}"
        width="${options.width}" height="${options.height}"
        frameborder="0" loading="lazy"
        title="${options.title.value}"
        style="border:0;border-radius:12px;"></iframe>`
  )

  const copied = ref(false)
  async function copyIframe() {
    try {
      await navigator.clipboard.writeText(iframeCode.value)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
    } catch {}
  }

  return {
    isWidgetMode,
    embedUrl,
    iframeCode,
    copied,
    copyIframe,
  }
}
