<script setup lang="ts">
/**
 * VARIAÇÃO 3 DA SEGURANÇA (?seguranca=3, só no dev): "O REGISTRO" (05/11/2026).
 * Prova pelo histórico, não pela promessa: o registro de acesso de um cliente,
 * como o produto grava (business_client_access_log, append-only) e como o
 * cliente o vê no link de gestão dele, com o mesmo rótulo de cada evento
 * (utils/clientes.ts, ACTION_LABEL). Ao lado, três frases; o hover (ou o foco)
 * numa frase acende as linhas que a provam.
 *
 * O QUE É CENA: os nomes, as datas e as horas (o elenco das calls). Os eventos
 * são de verdade, e nenhum inventado: não existe linha "nenhuma ordem enviada",
 * porque o produto não tem ordem para registrar; quem diz isso é a terceira
 * frase, sobre o registro inteiro. A última linha é a validade do
 * consentimento (12 meses), que o link de gestão mostra, e vem tracejada.
 * A revogação não entra como linha: os clientes do elenco estão todos
 * conectados na fila e nos passos (o Lucas responde na quinta, 05/11).
 *
 * SSR: todas as linhas no HTML. O gesto (as linhas entram uma vez, em
 * sequência, quando o registro chega na tela) só arma se ele estiver abaixo da
 * tela ao montar. Nada em loop; com reduzir movimento, nada entra.
 */
import { SEGURANCA_REGISTRO } from '~/content/business/landing'

const R = SEGURANCA_REGISTRO
const frase = ref(-1)
const acesas = computed(() => new Set(frase.value >= 0 ? R.frases[frase.value]!.linhas : []))

const raiz = ref<HTMLElement | null>(null)
const armada = ref(false)
const viu = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  const el = raiz.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return
  armada.value = true
  io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { viu.value = true; io?.disconnect(); io = null }
  }, { threshold: 0.3 })
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="raiz" class="bsr" :class="{ 'bsr--armada': armada && !viu, 'bsr--viu': viu, 'bsr--realce': frase >= 0 }">
    <figure class="bsr__folha">
      <figcaption class="bsr__cab">
        <span class="bsr__titulo">{{ R.titulo }}</span>
        <span class="bsr__pontos" aria-hidden="true"><i /><i /><i /></span>
      </figcaption>
      <ol class="bsr__linhas">
        <li
          v-for="(l, i) in R.linhas" :key="l.quando + l.acao" class="bsr__linha"
          :class="{ 'bsr__linha--futura': l.futura, 'bsr__linha--acesa': acesas.has(i) }" :style="{ '--i': i }"
        >
          <time class="bsr__quando">{{ l.quando }}</time>
          <span class="bsr__quem">{{ l.quem }}</span>
          <span class="bsr__acao">{{ l.texto }}</span>
        </li>
      </ol>
    </figure>
    <ul class="bsr__frases">
      <li v-for="(f, k) in R.frases" :key="f.id" class="bsr__frase-li">
        <!-- botão só para o teclado alcançar o realce; não muda nada além dele -->
        <button
          type="button" class="bsr__frase" :class="{ 'bsr__frase--on': frase === k }" :aria-pressed="frase === k"
          @mouseenter="frase = k" @mouseleave="frase = -1" @focus="frase = k" @blur="frase = -1" @click="frase = frase === k ? -1 : k"
        >{{ f.t }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bsr {
  --mono: ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  max-width: 1120px; margin: clamp(36px, 4.4vw, 56px) auto 0;
  display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(24px, 3vw, 32px);
}

/* ——— a folha do registro: navy, monoespaçado, como o extrato de auditoria ——— */
.bsr__folha {
  position: relative; margin: 0; padding: 6px clamp(16px, 2.6vw, 30px) clamp(14px, 2vw, 22px); border-radius: var(--nu-r-card);
  background: var(--nu-navy); color: var(--nu-cream-text);
  box-shadow: 0 0 0 1px var(--nu-white-14) inset, 0 40px 80px -40px rgba(12, 21, 36, .55), 0 18px 40px -24px rgba(12, 21, 36, .35);
}
.bsr__folha::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; padding: 1px;
  background: linear-gradient(180deg, var(--nu-white-14), transparent 22%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
}
.bsr__cab { display: flex; align-items: center; justify-content: space-between; padding: 16px 0 14px; border-bottom: 1px solid var(--nu-cream-text-14); }
.bsr__titulo { color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: .14em; text-transform: uppercase; }
.bsr__pontos { display: flex; gap: 5px; }
.bsr__pontos i { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-cream-text-18); }

.bsr__linhas { list-style: none; margin: 0; padding: 0; }
.bsr__linha {
  display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: 'quando quem' 'acao acao'; gap: 2px 12px; align-items: baseline;
  padding: 12px 10px; margin: 0 -10px; border-radius: 10px; border-bottom: 1px solid var(--nu-cream-text-08);
  font-family: var(--mono); font-size: var(--nu-fs-dense); font-variant-numeric: tabular-nums; line-height: 1.45;
  transition: background .25s ease, opacity .25s ease;
}
.bsr__linha:last-child { border-bottom: 0; }
.bsr__linha:hover { background: color-mix(in srgb, var(--nu-white) 6%, transparent); }
.bsr__quando { grid-area: quando; color: var(--nu-cream-text-55); }
.bsr__quem { grid-area: quem; color: var(--nu-cream-text-78); }
.bsr__acao { grid-area: acao; color: var(--nu-cream-text); font-weight: 600; }
.bsr__acao::before { content: '› '; color: var(--nu-biz-lavanda); }
/* a validade do consentimento: ainda não aconteceu */
.bsr__linha--futura { margin-top: 6px; border: 1px dashed var(--nu-cream-text-18); }
.bsr__linha--futura .bsr__acao { color: var(--nu-cream-text-70); font-weight: 500; }
.bsr__linha--futura .bsr__acao::before { content: '◦ '; }

/* o realce: a frase acende as linhas que a provam, as outras recuam */
.bsr--realce .bsr__linha { opacity: .38; }
.bsr--realce .bsr__linha--acesa { opacity: 1; background: color-mix(in srgb, var(--nu-biz-lavanda) 12%, transparent); }

/* ——— as três frases ——— */
.bsr__frases { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.bsr__frase-li { border-top: 1px solid var(--nu-cream-line); }
.bsr__frase-li:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.bsr__frase {
  width: 100%; min-height: 56px; padding: 16px 2px; border: 0; background: none; cursor: default; text-align: left;
  color: var(--nu-ink); font-family: var(--serifa); font-size: clamp(22px, 2.2vw, 28px); font-weight: 400; letter-spacing: -0.015em; line-height: 1.2; text-wrap: balance;
  transition: color .2s ease;
}
.bsr__frase:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 8px; }
.bsr__frases:has(.bsr__frase--on) .bsr__frase:not(.bsr__frase--on) { color: color-mix(in srgb, var(--nu-ink) 45%, transparent); }

@media (min-width: 640px) {
  .bsr__linha { grid-template-columns: 17ch 9ch minmax(0, 1fr); grid-template-areas: 'quando quem acao'; }
}
@media (min-width: 960px) {
  .bsr { grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); align-items: center; gap: clamp(36px, 5vw, 72px); }
}

/* ——— o gesto de entrada: as linhas entram uma vez, em sequência ——— */
@media (prefers-reduced-motion: no-preference) {
  .bsr--armada .bsr__linha { opacity: 0; }
  .bsr--viu .bsr__linha { animation: bsr-entra .52s var(--nu-ease-saida) backwards; animation-delay: calc(.12s + var(--i) * .14s); }
}
@keyframes bsr-entra { from { opacity: 0; transform: translateY(6px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
@media (prefers-reduced-motion: reduce) {
  .bsr__linha, .bsr__frase { transition: none; }
}
</style>
