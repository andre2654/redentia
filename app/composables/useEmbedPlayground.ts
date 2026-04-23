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

  // Em widget mode, garantir que TODOS os cliques em links internos
  // (/asset/XXX, etc) escapem do iframe e abram em nova aba no site
  // principal. Duas camadas:
  //  1. <base target="_blank"> — funciona para <a> nativos (carrossel, ranking)
  //  2. Listener JS global — pega custom elements como <NuxtLink> que em
  //     dev mode podem não virar <a> puro (treemap do heatmap). Também é
  //     um safety net se o browser do site host remover o <base>.
  if (isWidgetMode.value) {
    useHead({
      base: { target: '_blank' },
    })

    if (import.meta.client) {
      onMounted(() => {
        const origin = String(runtimeConfig.public?.siteUrl || brand.url || '').replace(/\/$/, '')
        document.addEventListener(
          'click',
          (e) => {
            const target = e.target as HTMLElement | null
            if (!target) return
            const el = target.closest('a, [href], [to]') as HTMLElement | null
            if (!el) return
            const rawHref = el.getAttribute('href') || el.getAttribute('to') || ''
            if (!rawHref) return
            // Só intercepta links pro site principal (asset, calculadora, guias etc)
            const isInternalPath = rawHref.startsWith('/') && !rawHref.startsWith('//')
            const url = isInternalPath ? `${origin}${rawHref}` : rawHref
            // Se já for target=_blank ou já tiver aberto, não interfere
            if ((el as HTMLAnchorElement).target === '_blank') return
            e.preventDefault()
            e.stopPropagation()
            window.open(url, '_blank', 'noopener,noreferrer')
          },
          true,
        )
      })
    }
  }

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
