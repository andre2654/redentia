<script setup lang="ts">
// Lista ranqueada em duas colunas (1 a 5 à esquerda, 6 a 10 à direita), como a
// lista sob cada gráfico do ranking do OpenRouter, em pele Nu: posição,
// selo com a inicial do fornecedor, nome em 800 + "por Fornecedor", e à
// direita o número com a métrica de apoio embaixo. Estreito (< 600px): uma coluna.
// A margem de erro aparece sempre; quem divide a posição ganha o selo
// "empate" ao lado do nome (revisão de UX, 16/10: antes o empate escondia a
// margem justo onde ela importa). `numbered: false` tira a posição quando a
// ordem não é placar (custo: o mais barato não é o "1º").
// `interactive`: a linha conversa com um gráfico ao lado (Carteira própria).
// Hover ou foco emitem `hover` com o id (e null ao sair), clique ou Enter
// emitem `pick`; a linha de `activeId` (o modelo que o gráfico mostra) ganha o
// selo em azul cheio.
import type { BenchRankingRow } from '~/types/benchmark'

const props = withDefaults(defineProps<{
  rows: BenchRankingRow[]
  format?: (v: number) => string
  numbered?: boolean
  interactive?: boolean
  activeId?: string | null
}>(), { format: undefined, numbered: true, interactive: false, activeId: null })
const emit = defineEmits<{ (e: 'hover', id: string | null): void; (e: 'pick', id: string): void }>()
const fmt = (v: number) => (props.format ?? fmtBench.one)(v)
const half = computed(() => Math.ceil(props.rows.length / 2))
const cols = computed(() => [props.rows.slice(0, half.value), props.rows.slice(half.value)])
const sub = (r: BenchRankingRow) => r.extra ?? (r.hi > r.lo ? `de ${fmt(r.lo)} a ${fmt(r.hi)}` : '')
</script>

<template>
  <div class="brl-box">
  <div class="brl" :class="{ 'brl--plain': !numbered, 'brl--live': interactive }" @mouseleave="interactive && emit('hover', null)">
    <ol v-for="(col, c) in cols" :key="c" class="brl__col" :start="c === 0 ? 1 : half + 1">
      <li
        v-for="r in col" :key="r.id" class="brl__row" :class="{ 'brl__row--on': interactive && r.id === activeId }"
        :tabindex="interactive ? 0 : undefined" :aria-current="interactive && r.id === activeId ? 'true' : undefined"
        @mouseenter="interactive && emit('hover', r.id)" @focus="interactive && emit('hover', r.id)" @blur="interactive && emit('hover', null)"
        @click="interactive && emit('pick', r.id)" @keydown.enter.prevent="interactive && emit('pick', r.id)"
      >
        <span v-if="numbered" class="brl__pos">{{ r.rank }}</span>
        <span class="brl__tile" :class="{ 'brl__tile--logo': benchLogo(r.id) }" aria-hidden="true">
          <img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" class="brl__logo" width="20" height="20" loading="lazy" decoding="async">
          <template v-else>{{ r.provider.charAt(0) }}</template>
        </span>
        <span class="brl__who">
          <span class="brl__name">{{ r.name }}<span v-if="numbered && r.tied" class="brl__tie">empate</span></span>
          <span class="brl__prov">por {{ r.provider }}</span>
        </span>
        <span class="brl__num">
          <span class="brl__val">{{ fmt(r.value) }}</span>
          <span class="brl__sub">{{ sub(r) }}</span>
        </span>
      </li>
    </ol>
  </div>
  </div>
</template>

<style scoped>
/* escala compacta (dono, 15/10: "pode diminuir um pouco esses itens"):
   selo de 32px, nome 14px, nota 16px, linha de ~52px */
.brl-box { container-type: inline-size; margin-top: 18px; }
.brl { display: grid; grid-template-columns: 1fr 1fr; gap: 0 clamp(24px, 4vw, 56px); }
.brl__col { list-style: none; margin: 0; padding: 0; }
.brl__row {
  display: grid; grid-template-columns: 20px 32px 1fr auto; align-items: center; gap: 12px;
  padding: 10px 0;
}
.brl--plain .brl__row { grid-template-columns: 32px 1fr auto; }
.brl__row + .brl__row { border-top: 1px solid var(--nu-cream-2); }
.brl__pos { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.brl__tile {
  width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center;
  background: var(--nu-tile-blue-bg); color: var(--nu-blue-deep); font-size: var(--nu-fs-sm); font-weight: 800;
}
.brl__who { display: flex; flex-direction: column; min-width: 0; }
.brl__name {
  display: flex; align-items: center; gap: 6px; min-width: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; letter-spacing: -.1px;
}
.brl__tie {
  flex-shrink: 0; border-radius: var(--nu-r-pill); padding: 1px 7px;
  background: var(--nu-blue-tint); color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0;
}
.brl__prov { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.brl__num { display: flex; flex-direction: column; align-items: flex-end; }
.brl__val { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
/* `pre`: não quebra sozinho, mas o \n do `extra` vira linha (Carteira própria: total e maior queda) */
.brl__sub { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; white-space: pre; text-align: right; }

/* linha que conversa com o gráfico: realce no hover e selo azul no modelo em destaque */
.brl--live .brl__row {
  margin: 0 -12px; padding: 10px 12px; border-radius: var(--nu-r-tile); cursor: pointer; outline: none;
  transition: background .18s;
}
.brl--live .brl__row:hover, .brl--live .brl__row:focus-visible { background: var(--b-surface, var(--nu-cream)); }
.brl--live .brl__row:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; }
.brl__tile { transition: background .18s, color .18s; }
.brl__row--on .brl__tile { background: var(--nu-blue); color: var(--nu-white); }
/* logo do modelo: fundo branco com fio, para a cor da marca não brigar com o azul da casa */
.brl__tile--logo { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-2); }
.brl__row--on .brl__tile--logo { background: var(--nu-white); box-shadow: inset 0 0 0 2px var(--nu-blue); }
.brl__logo { width: 62%; height: 62%; display: block; object-fit: contain; }

@container (max-width: 600px) {
  .brl { grid-template-columns: 1fr; }
  .brl__col + .brl__col .brl__row:first-child { border-top: 1px solid var(--nu-cream-2); }
  .brl__row { grid-template-columns: 18px 30px 1fr auto; gap: 10px; }
  .brl--plain .brl__row { grid-template-columns: 30px 1fr auto; }
  .brl__tile { width: 30px; height: 30px; border-radius: 9px; }
}
</style>
