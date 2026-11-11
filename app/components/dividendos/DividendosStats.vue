<script setup lang="ts">
// Os números do topo de /dividendos/[ticker]. 2ª rodada da Aportou
// (11/11/2026): moram no cartão carvão com a faixa da marca, à direita do
// topo em duas colunas (como o cartão do gráfico no /asset). O primeiro número
// (o dividend yield, quando existe) é o número-herói; os demais ficam embaixo,
// cada um com a sua fonte. São os MESMOS itens de antes, com os mesmos valores
// e as mesmas fontes; o accent verde é o do próximo pagamento anunciado.
import type { AcaoStatRow } from '~/types/acao'

const props = defineProps<{ items: AcaoStatRow[] }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
const heroi = computed(() => props.items[0] ?? null)
const demais = computed(() => props.items.slice(1))
const contexto = (s: AcaoStatRow) => ({ id: `dividendos:${sobre.value}:${s.l}`, tipo: 'proventos', rotulo: rotuloComSobre(s.l, sobre.value), texto: `${s.l}${sobre.value ? ` (${sobre.value})` : ''}: ${s.v}${s.fonte ? ` · ${s.fonte}` : ''}` })
</script>

<template>
  <NuFaixaMarca :rotulo="sobre ? `Proventos de ${sobre}` : 'Proventos'" como="p" :altura="56" class="dvs">
    <div v-if="heroi" v-contexto-chat="contexto(heroi)" class="dvs__heroi">
      <span class="dvs__heroi-v" :class="{ 'dvs__value--green': heroi.accent === 'green' }">{{ heroi.v }}</span>
      <span class="dvs__heroi-l">{{ heroi.l }}</span>
      <span v-if="heroi.fonte" class="dvs__fonte">{{ heroi.fonte }}</span>
    </div>
    <div v-if="demais.length" class="dvs__grid">
      <div v-for="s in demais" :key="s.l" v-contexto-chat="contexto(s)" class="dvs__card">
        <span class="dvs__label">{{ s.l }}</span>
        <span class="dvs__value" :class="{ 'dvs__value--green': s.accent === 'green' }">{{ s.v }}</span>
        <span v-if="s.fonte" class="dvs__fonte">{{ s.fonte }}</span>
      </div>
    </div>
  </NuFaixaMarca>
</template>

<style scoped>
.dvs { --pad: clamp(20px, 2.4vw, 32px); overflow: hidden; animation: nu-fade .5s ease .1s both; }
.dvs__heroi { display: flex; flex-direction: column; gap: 6px; padding: clamp(22px, 2.6vw, 32px) var(--pad) clamp(20px, 2.4vw, 28px); }
.dvs__heroi-v {
  color: var(--nu-white); font-size: clamp(46px, 5.2vw, 68px); font-weight: 800;
  letter-spacing: -.035em; font-variant-numeric: tabular-nums; line-height: 1; overflow-wrap: anywhere;
}
.dvs__heroi-l { margin-top: 4px; color: var(--nu-on-dark); font-size: 14.5px; font-weight: 700; }
.dvs__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr)); gap: 20px 24px;
  margin: 0 var(--pad); padding: clamp(18px, 2vw, 24px) 0 clamp(22px, 2.6vw, 30px); border-top: 1.5px solid var(--nu-dark-line);
}
.dvs__card { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.dvs__label { color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 600; }
.dvs__value {
  color: var(--nu-white); font-size: clamp(20px, 2vw, 25px); font-weight: 800;
  letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1.2;
  overflow-wrap: anywhere;
}
.dvs__value--green { color: var(--nu-green-soft); }
.dvs__fonte { color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.4; }
@media (max-width: 480px) { .dvs__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) { .dvs { animation: none; } }
</style>
