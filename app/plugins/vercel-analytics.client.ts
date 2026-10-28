// Vercel Web Analytics SEM o pacote @vercel/analytics.
//
// Por quê sem o pacote: @vercel/analytics declara peerOptional
// vue-router@^4 e conflita com o vue-router 5 do Nuxt 4 — o install
// legacy-peer-deps poda o tree e quebra o @nuxt/vite-builder no build.
//
// O tracking é o mesmo: a própria Vercel serve /_vercel/insights/script.js
// em produção (quando Web Analytics está ligado no projeto). Esse script
// auto-reporta o pageview inicial E as navegações client-side (patcha o
// history API), então cobre o SSR + SPA do Nu sem nada manual.
//
// Cookieless, e mesmo assim atrás do consentimento. Não grava _ga nem
// _clck, mas manda pageview (caminho, referência) para a Vercel. O aviso
// pede aceite antes de qualquer rastreio; o script não é necessário para
// a página funcionar. Sem aceite, o <script> não entra no head.
//
// Em localhost o endpoint não existe (404 inofensivo); em prod flui normal.
// Com o aceite já gravado, carrega na inicialização (ocioso: false), como
// antes do aviso — não espera o requestIdleCallback.
//
// NÃO carrega em rota com token no path (/cliente/convite, /cliente/acesso,
// /business/convite): o pageview levaria o segredo. Ver
// utils/analytics-privacy.ts.
import { isSecretTokenPath } from '~/utils/analytics-privacy'
import { agendarComConsentimento, lerConsentimento } from '~/utils/consent'

export default defineNuxtPlugin(() => {
  if (isSecretTokenPath(window.location.pathname)) return

  let carregado = false

  const instalar = () => {
    if (carregado) return
    if (lerConsentimento() !== 'granted') return
    if (isSecretTokenPath(window.location.pathname)) return
    carregado = true

    const w = window as unknown as { va?: (...p: unknown[]) => void, vaq?: unknown[] }

    // Fila padrão do SDK: eventos custom (ex.: w.va('event', {...})) disparados
    // antes do script chegar ficam buffered e são drenados no load.
    w.va = w.va || function (...params: unknown[]) {
      (w.vaq = w.vaq || []).push(params)
    }

    useHead({
      script: [
        {
          src: '/_vercel/insights/script.js',
          defer: true,
          'data-sdkn': '@vercel/analytics',
        },
      ],
    })
  }

  agendarComConsentimento(instalar, { ocioso: false })
})
