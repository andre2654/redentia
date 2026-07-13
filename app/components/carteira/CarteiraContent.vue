<script setup lang="ts">
// Miolo da carteira — extraído de pages/carteira.vue (mesmo padrão do
// MercadoContent: 1 implementação de conteúdo; a página /carteira é um
// wrapper fino que cuida de auth + SEO). Usado APENAS pela página /carteira —
// a home `/` mostra só o resumo compacto (MercadoSuaCarteira).
// Contrato de UX: docs/redentia-nu/designs/Redentia Carteira Nu.dc.html.
//
// TELA DINÂMICA POR CARD (diretriz nº1): sem Open Finance conectado a página
// VIRA a experiência de conexão (CarteiraHero state 'connect' + Pluggy
// Connect); cada seção decide cheio | parcial | vazio no useCarteira — seções
// sem dado real simplesmente não renderizam. Nunca número inventado.
import type { CarteiraPayload } from '~/types/carteira'

const props = defineProps<{ payload: CarteiraPayload }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

// Banner contextual (PR-R6): SÓ quando conectado ('patrimonio') declaramos as
// seções → o layout troca o ticker pelo NuSectionRail. No estado 'connect'
// (sem Open Finance) a lista sai vazia → o composable zera o estado → fica o
// ticker "Mercado agora". Cada seção só entra na lista se seu dado existir
// (MESMA condição do template abaixo), então o rail nunca aponta pra um #id
// que não está no DOM. Labels/ordem = print do dono; ids batem com o template.
const railSections = computed<RailSection[]>(() => {
  const p = props.payload
  if (p.hero.state !== 'patrimonio') return []
  const s: RailSection[] = []
  if (p.chart) s.push({ id: 'desempenho', label: 'Desempenho' })
  if (p.groups.length && p.positionsSub) s.push({ id: 'posicoes', label: 'Posições' })
  if (p.raiox) s.push({ id: 'raio-x', label: 'Raio-X da carteira' })
  if (p.income) s.push({ id: 'renda-passiva', label: 'Renda passiva' })
  if (p.movements) s.push({ id: 'movimentacoes', label: 'Movimentações' })
  if (p.heatmap) s.push({ id: 'pnl', label: 'P&L mês a mês' })
  return s
})
useSectionRail(railSections, { pageLabel: 'Carteira' })
</script>

<template>
  <div>
    <CarteiraHero :hero="payload.hero" :allocation="payload.allocation" @connected="emit('connected')" />
    <NuPortfolioChart v-if="payload.chart" id="desempenho" class="car-sec" :chart="payload.chart" />
    <CarteiraPositions v-if="payload.groups.length && payload.positionsSub" id="posicoes" class="car-sec" :sub="payload.positionsSub" :groups="payload.groups" />
    <CarteiraRaioX v-if="payload.raiox" id="raio-x" class="car-sec" :raiox="payload.raiox" />
    <CarteiraIncome v-if="payload.income" id="renda-passiva" class="car-sec" :income="payload.income" />
    <CarteiraMovements v-if="payload.movements" id="movimentacoes" class="car-sec" :movements="payload.movements" />
    <CarteiraHeatmap v-if="payload.heatmap" id="pnl" class="car-sec" :heatmap="payload.heatmap" />
  </div>
</template>

<style scoped>
/* Alvos do rail (PR-R6): scroll-margin compensa o header sticky (--nuh-h) + a
   própria faixa do rail (~51px) pra a seção parar logo abaixo dela. O scoped
   alcança a raiz de cada componente-filho (todos têm 1 root <section>). */
.car-sec { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
</style>
