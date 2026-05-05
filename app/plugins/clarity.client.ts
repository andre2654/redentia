/**
 * Microsoft Clarity — session recordings + heatmaps + AI insights.
 *
 * INSTALADO PRA QUE:
 * Diagnostico do gargalo Lead → CR no /raio-x. Pixel mostra que 39
 * pessoas geram raio-x mas so 6 cadastram. Clarity captura sessoes
 * reais pra entender onde estao os 33 abandonos:
 *   - Rage clicks (frustracao) no modal de cadastro
 *   - Dead clicks (botoes que nao respondem)
 *   - JavaScript errors em mobile
 *   - Heatmap do scroll/clicks no /raio-x
 *
 * STRATEGY DE LOAD:
 * Lazy via requestIdleCallback (mesmo padrao do meta-pixel.client.ts).
 * Pixel + Clarity carregam APOS LCP, nao competem com criatico/CSS.
 * Tradeoff: sessoes < 2.5s nao sao gravadas, mas sao bounces irrelevantes.
 *
 * Project ID: wmh9pyc3io (Redentia, criado 2026-05-05).
 * Lê de runtimeConfig.public.clarityProjectId — fallback hardcoded
 * pro MVP. Pra desligar em algum env, basta NUXT_PUBLIC_CLARITY_PROJECT_ID=
 * vazio no .env.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const projectId
    = ((config.public as Record<string, unknown>).clarityProjectId as string | undefined)
    || 'wmh9pyc3io'

  if (!projectId) return

  // Snippet oficial da Microsoft, adaptado pra TS + lazy load.
  // Mesmo padrao "stub-and-load" do GA4/fbq: cria a fila imediatamente
  // (window.clarity = function(){ queue.push(args) }) e injeta o script
  // depois. Eventos disparados antes do script chegar ficam buffered.
  const installClarity = () => {
    if ((window as { clarity?: unknown }).clarity) return

    ;(function (c: Window & { clarity?: unknown }, l: Document, a: string, r: string, i: string) {
      const w = c as Window & { clarity?: { (...args: unknown[]): void; q?: unknown[] } }
      w.clarity
        = w.clarity
        || function (...args: unknown[]) {
          (w.clarity!.q = w.clarity!.q || []).push(args)
        }
      const t = l.createElement(r) as HTMLScriptElement
      t.async = true
      t.src = `https://www.clarity.ms/tag/${i}`
      const y = l.getElementsByTagName(r)[0] as HTMLScriptElement | undefined
      if (y && y.parentNode) y.parentNode.insertBefore(t, y)
    })(window, document, 'clarity', 'script', projectId)
  }

  // requestIdleCallback respeita o motor de prioridade do browser e nao
  // dispara durante input lag. Fallback setTimeout 2.5s pra Safari.
  if ('requestIdleCallback' in window) {
    ;(window as Window & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback(installClarity, { timeout: 4000 })
  }
  else {
    setTimeout(installClarity, 2500)
  }
})
