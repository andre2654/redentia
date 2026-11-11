<script setup lang="ts">
// "A análise completa" (31/10/2026): o que a /carteira mostrava de cara —
// desempenho contra IBOV e CDI, movimentações e P&L mês a mês — agora sob
// pedido, depois do topo calmo. Os componentes são os mesmos de antes, com os
// mesmos números; só deixaram de disputar a primeira olhada. O Raio-X da
// carteira saiu em 07/11/2026 (o relatório da carteira entra no lugar).
// Chegar com âncora de uma dessas seções (#pnl…, os atalhos da home) abre a
// análise sozinho.
import type { CarteiraPayload } from '~/types/carteira'

// enxuta (a /carteira nova, 06/11/2026): sem o banner do MCP
const props = defineProps<{ payload: CarteiraPayload; enxuta?: boolean }>()

const ANCORAS = ['desempenho', 'movimentacoes', 'pnl']
const aberta = ref(false)

const partes = computed(() => {
  const p = props.payload
  const l: string[] = []
  if (p.chart) l.push('desempenho')
  if (p.movements) l.push('movimentações')
  if (p.heatmap) l.push('P&L mês a mês')
  return l
})
const resumo = computed(() => {
  const l = partes.value
  if (!l.length) return ''
  const txt = l.length === 1 ? l[0]! : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`
  return txt.charAt(0).toUpperCase() + txt.slice(1) + '.'
})

onMounted(() => {
  const id = useRoute().hash.slice(1)
  if (id && ANCORAS.includes(id)) {
    aberta.value = true
    nextTick(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
  }
})
</script>

<template>
  <div v-if="partes.length">
    <section class="can" :class="{ 'can--aberta': aberta }">
      <button type="button" class="can__botao" :aria-expanded="aberta" aria-controls="can-conteudo" @click="aberta = !aberta">
        <span class="can__textos">
          <span class="can__titulo">{{ aberta ? 'Esconder a análise completa' : 'Ver a análise completa' }}</span>
          <span class="can__sub">{{ resumo }}</span>
        </span>
        <svg class="can__seta" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </section>

    <div v-if="aberta" id="can-conteudo" class="can__conteudo">
      <NuPortfolioChart v-if="payload.chart" id="desempenho" class="can__sec" :chart="payload.chart" data-clarity-mask="true" />
      <CarteiraMovements v-if="payload.movements" id="movimentacoes" class="can__sec" :movements="payload.movements" data-clarity-mask="true" />
      <CarteiraHeatmap v-if="payload.heatmap" id="pnl" class="can__sec" :heatmap="payload.heatmap" data-clarity-mask="true" />
      <CarteiraMcpBanner v-if="!enxuta" />
    </div>
  </div>
</template>

<style scoped>
.can { background: var(--nu-page); padding: clamp(28px, 4vw, 48px) clamp(22px, 5.5vw, 80px); }
.can__botao {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: var(--nu-band); border: none; cursor: pointer; font-family: inherit; text-align: left;
  border-radius: var(--nu-r-card); padding: clamp(20px, 2.6vw, 28px) clamp(22px, 3vw, 32px); box-shadow: var(--nu-shadow-quente);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s;
}
.can__botao:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.can__textos { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.can__titulo { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.025em; }
.can__sub { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.can__seta { box-sizing: content-box; padding: 11px; border-radius: 50%; background: var(--nu-ink); color: var(--nu-white); flex-shrink: 0; transition: transform .25s; }
.can--aberta .can__seta { transform: rotate(180deg); }
.can__conteudo { animation: nu-fade .4s ease both; }
.can__sec { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
</style>
