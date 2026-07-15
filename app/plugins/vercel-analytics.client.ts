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
// Em localhost o endpoint não existe (404 inofensivo); em prod flui normal.
export default defineNuxtPlugin(() => {
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
})
