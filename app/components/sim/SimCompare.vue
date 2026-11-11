<script setup lang="ts">
// PROTÓTIPO /simulacao — comparação A vs B, v3 (iterações do dono, 25/08:
// card-painel "não agradou", frase editorial "não ficou claro"). Agora é um
// PLACAR: duas colunas simétricas, cada uma na COR da sua curva no gráfico
// (azul = sua carteira, âmbar = proposta), mediana como número grande e o
// delta como badge — o formato universal de comparação.
import type { SimResult } from './simMock'
import { fmtBRL } from './simMock'

const props = defineProps<{ a: SimResult; b: SimResult }>()
const emit = defineEmits<{ clear: []; edit: [] }>()

const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const valeA = computed(() => props.a.shockSummary?.totalPct ?? 0)
const valeB = computed(() => props.b.shockSummary?.totalPct ?? 0)
const delta = computed(() => props.b.final.p50 - props.a.final.p50)
const anchorDiff = computed(() => Math.abs(props.a.assumptions.anchor - props.b.assumptions.anchor) / props.a.assumptions.anchor > 0.01)
</script>

<template>
  <div v-contexto-chat="{ id: 'sim:comparar', tipo: 'grafico', rotulo: 'Carteira A x B' }" class="scp">
    <div class="scp__col">
      <div class="scp__head">
        <i class="scp__dot scp__dot--a" aria-hidden="true" />
        <span class="scp__name">Sua carteira</span>
      </div>
      <b class="scp__big">{{ fmtBRL(a.final.p50) }}</b>
      <span class="scp__sub">em 10 anos, mediana · vale {{ fmtPct(valeA) }}</span>
    </div>

    <div class="scp__col scp__col--b">
      <div class="scp__head">
        <i class="scp__dot scp__dot--b" aria-hidden="true" />
        <span class="scp__name">Proposta</span>
        <span class="scp__acts">
          <button type="button" class="scp__act" @click="emit('edit')">editar</button>
          <button type="button" class="scp__act" @click="emit('clear')">descartar</button>
        </span>
      </div>
      <b class="scp__big scp__big--b">
        {{ fmtBRL(b.final.p50) }}
        <em class="scp__delta" :class="delta < 0 ? 'scp__delta--down' : 'scp__delta--up'">{{ delta > 0 ? '+' : '−' }}{{ fmtBRL(Math.abs(delta)) }}</em>
      </b>
      <span class="scp__sub">em 10 anos, mediana · vale {{ fmtPct(valeB) }}<template v-if="anchorDiff"> · parte de {{ fmtBRL(b.assumptions.anchor) }}</template></span>
    </div>
  </div>
</template>

<style scoped>
.scp {
  margin-top: 18px;
  display: grid; grid-template-columns: 1fr 1fr;
  background: var(--nu-dark-chip); border-radius: var(--nu-r-panel);
  animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) backwards;
}
.scp__col { padding: 22px 26px 20px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.scp__col--b { border-left: 1px solid var(--nu-dark-chip-line); }

.scp__head { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.scp__dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.scp__dot--a { background: var(--nu-blue-on-dark); }
.scp__dot--b { background: var(--nu-amber); }
.scp__name { color: var(--nu-on-dark); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }

.scp__big {
  color: var(--nu-white); font-size: clamp(26px, 2.8vw, 38px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); font-variant-numeric: tabular-nums; line-height: 1.05;
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
}
.scp__big--b { color: var(--nu-amber); }
/* o selo da variação sobre carvão: raio 8 */
.scp__delta { padding: 4px 9px; border-radius: var(--nu-r-tag); font-size: 13.5px; font-weight: var(--nu-w-medio); font-style: normal; letter-spacing: 0; align-self: center; }
.scp__delta--down { background: var(--nu-red-soft-16); color: var(--nu-red-soft); }
.scp__delta--up { background: var(--nu-green-soft-16); color: var(--nu-green-soft); }
.scp__sub { color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }

.scp__acts { margin-left: auto; display: inline-flex; gap: 12px; }
.scp__act {
  border: none; background: transparent; padding: 0;
  color: var(--nu-on-dark); font-size: 13.5px; font-weight: var(--nu-w-medio);
  cursor: pointer; font-family: inherit;
  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-dark-chip-line);
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.scp__act:hover { color: var(--nu-white); }

@media (max-width: 700px) {
  .scp { grid-template-columns: 1fr; }
  .scp__col--b { border-left: none; border-top: 1px solid var(--nu-dark-chip-line); }
}
</style>
