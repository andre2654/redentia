<script setup lang="ts">
// Lista ranqueada do /benchmark-ia "A noite" (03/11/2026): uma linha
// por modelo, com a logo, o nome, uma barra calma e o número. Serve a todos os
// índices: nota com margem de erro (Placar geral), barra dividida em faixas
// (Inventa, Concorda), barra que sai do zero para os dois lados (Carteira,
// Previsão em formação) e barra simples (Tributário, Golpes, Custo).
//
// Sem entrada animada: a barra já sai pronta do SSR, então não há gráfico
// vazio esperando o IntersectionObserver (o defeito da página de hoje).
// Conversa com o resto da página pelo `foco`: o hover numa linha acende o
// modelo (emite `hover`), o clique fixa (emite `pick`); com um modelo em foco,
// as outras linhas recuam. No estreito, a barra desce para baixo do nome.
type Linha = {
  id: string
  name: string
  provider?: string
  rank?: number
  tied?: boolean
  value: number
  lo?: number
  hi?: number
  /** faixas da barra, em % (somam 100) */
  parts?: number[]
  /** uma ou duas linhas embaixo do número */
  extra?: string
}

const props = withDefaults(defineProps<{
  rows: Linha[]
  format?: (v: number) => string
  /** escala da barra; sem ela, 0 a 100 (ou o menor e o maior valor, quando há negativo) */
  min?: number
  max?: number
  /** tom de cada faixa de `parts` */
  tons?: ('bom' | 'meio' | 'ruim')[]
  numerado?: boolean
  foco?: string | null
  tom?: 'claro' | 'escuro'
  /** como ler a linha, para leitor de tela ("nota", "excesso sobre o Ibovespa") */
  rotulo?: string
}>(), { format: undefined, min: undefined, max: undefined, tons: () => ['bom', 'meio', 'ruim'], numerado: true, foco: null, tom: 'claro', rotulo: 'nota' })
const emit = defineEmits<{ (e: 'hover', id: string | null): void; (e: 'pick', id: string): void }>()

const fmt = (v: number) => (props.format ?? fmtBench.one)(v)
const escala = computed(() => {
  const vals = props.rows.flatMap((r) => [r.value, r.lo ?? r.value, r.hi ?? r.value])
  const temNegativo = vals.some((v) => v < 0)
  if (props.min != null || props.max != null) return { lo: props.min ?? 0, hi: props.max ?? 100 }
  if (temNegativo) {
    // em volta do zero: a mesma distância para os dois lados, com folga
    const m = Math.max(...vals.map(Math.abs), 0.0001) * 1.08
    return { lo: -m, hi: m }
  }
  return { lo: 0, hi: Math.max(100, ...vals) }
})
const pos = (v: number) => Math.min(100, Math.max(0, ((v - escala.value.lo) / (escala.value.hi - escala.value.lo || 1)) * 100))
const zero = computed(() => (escala.value.lo < 0 ? pos(0) : 0))
const barra = (v: number) => {
  const a = pos(v)
  return { left: `${Math.min(a, zero.value)}%`, width: `${Math.max(0.6, Math.abs(a - zero.value))}%` }
}
const aria = (r: Linha) => [
  props.numerado && r.rank ? `${r.rank}º` : '',
  r.name,
  `${props.rotulo} ${fmt(r.value)}`,
  r.lo != null && r.hi != null && r.hi > r.lo ? `margem de ${fmt(r.lo)} a ${fmt(r.hi)}` : '',
  r.extra?.replace(/\n/g, ', ') ?? '',
].filter(Boolean).join(', ')
</script>

<template>
  <div class="bdl" :class="[`bdl--${tom}`, { 'bdl--foco': !!foco, 'bdl--sem-num': !numerado }]">
    <ol class="bdl__lista" @mouseleave="emit('hover', null)">
      <li v-for="r in rows" :key="r.id" class="bdl__item" :class="{ 'bdl__item--on': r.id === foco, 'bdl__item--top': numerado && r.rank === 1 }">
        <button
          type="button" class="bdl__l" :aria-pressed="r.id === foco" :aria-label="aria(r)"
          @mouseenter="emit('hover', r.id)" @focus="emit('hover', r.id)" @blur="emit('hover', null)" @click="emit('pick', r.id)"
        >
          <span v-if="numerado" class="bdl__pos" aria-hidden="true">{{ r.rank }}º</span>
          <span class="bdl__who" aria-hidden="true">
            <span class="bdl__tile">
              <img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="14" height="14" loading="lazy" decoding="async">
              <template v-else>{{ r.name.charAt(0) }}</template>
            </span>
            <span class="bdl__name">{{ r.name }}</span>
          </span>
          <span class="bdl__track" aria-hidden="true">
            <span v-if="zero > 0" class="bdl__zero" :style="{ left: `${zero}%` }" />
            <template v-if="r.parts?.length">
              <span class="bdl__faixas">
                <span v-for="(p, k) in r.parts" :key="k" class="bdl__faixa" :class="`bdl__faixa--${tons[k] ?? 'meio'}`" :style="{ width: `${p}%` }" />
              </span>
            </template>
            <span v-else class="bdl__fill" :class="{ 'bdl__fill--neg': r.value < 0 }" :style="barra(r.value)" />
            <span
              v-if="!r.parts?.length && r.lo != null && r.hi != null && r.hi > r.lo" class="bdl__ic"
              :style="{ left: `${pos(r.lo)}%`, width: `${pos(r.hi) - pos(r.lo)}%` }"
            />
          </span>
          <span class="bdl__num" aria-hidden="true">
            <span class="bdl__val">{{ fmt(r.value) }}</span>
            <span v-if="r.extra" class="bdl__extra">{{ r.extra }}</span>
          </span>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.bdl {
  container-type: inline-size;
  --cols: 28px minmax(0, 240px) minmax(0, 1fr) minmax(64px, auto);
  --pista: var(--nu-cream);
  --tinta: var(--nu-ink);
  --apoio: var(--nu-gray);
  --fio: var(--nu-line-2);
  --hover: var(--nu-cream-2);
}
.bdl--escuro {
  --pista: var(--nu-cream-text-10);
  --tinta: var(--nu-white);
  --apoio: var(--nu-on-dark-2);
  --fio: var(--nu-dark-line);
  --hover: var(--nu-cream-text-08);
}
.bdl--sem-num { --cols: minmax(0, 240px) minmax(0, 1fr) minmax(64px, auto); }
.bdl__lista { list-style: none; margin: 0; padding: 0; }
.bdl__item + .bdl__item { border-top: 1.5px solid var(--fio); }
.bdl__l {
  display: grid; grid-template-columns: var(--cols); align-items: center; gap: 14px;
  width: calc(100% + 24px); margin: 0 -12px; padding: 11px 12px; border: 0; border-radius: var(--nu-r-chip);
  background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer;
  transition: background .18s ease, opacity .18s ease;
}
.bdl__l:hover { background: var(--hover); }
.bdl__l:focus-visible { outline-offset: -3px; }
/* um modelo em foco: o resto recua */
.bdl--foco .bdl__item:not(.bdl__item--on) .bdl__l { opacity: .45; }
.bdl--foco .bdl__item:not(.bdl__item--on) .bdl__l:hover { opacity: .8; }

.bdl__pos { color: var(--apoio); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.bdl__who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.bdl__tile {
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; display: grid; place-items: center;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-line-2);
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio);
}
.bdl__tile img { width: 14px; height: 14px; display: block; object-fit: contain; }
.bdl__name { min-width: 0; color: var(--tinta); font-size: 14.5px; font-weight: var(--nu-w-medio); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bdl__track { position: relative; height: 10px; border-radius: var(--nu-r-pill); background: var(--pista); }
.bdl__fill { position: absolute; top: 0; bottom: 0; border-radius: var(--nu-r-pill); background: var(--nu-blue-soft); transition: background .18s ease; }
.bdl__item--top .bdl__fill, .bdl__item--on .bdl__fill { background: var(--nu-blue); }
.bdl__fill--neg, .bdl__item--on .bdl__fill--neg { background: var(--nu-red); }
.bdl--escuro .bdl__fill { background: var(--nu-cream-text-35); }
.bdl--escuro .bdl__item--top .bdl__fill, .bdl--escuro .bdl__item--on .bdl__fill { background: var(--nu-blue-soft); }
.bdl__zero { position: absolute; top: -5px; bottom: -5px; width: 1px; background: var(--nu-ink-30); }
.bdl--escuro .bdl__zero { background: var(--nu-cream-text-45); }
.bdl__faixas { position: absolute; inset: 0; display: flex; gap: 2px; border-radius: inherit; overflow: hidden; }
.bdl__faixa { height: 100%; }
.bdl__faixa--bom { background: var(--nu-blue); }
.bdl__faixa--meio { background: var(--nu-sand); }
.bdl__faixa--ruim { background: var(--nu-red); }
/* margem de erro: um traço fino com pontas, por cima da barra */
.bdl__ic { position: absolute; top: 50%; height: 2px; transform: translateY(-50%); background: var(--nu-ink); }
.bdl__ic::before, .bdl__ic::after { content: ''; position: absolute; top: -4px; width: 2px; height: 10px; border-radius: 1px; background: var(--nu-ink); }
.bdl__ic::before { left: 0; }
.bdl__ic::after { right: 0; }
.bdl--escuro .bdl__ic, .bdl--escuro .bdl__ic::before, .bdl--escuro .bdl__ic::after { background: var(--nu-white); }

.bdl__num { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.bdl__val { color: var(--tinta); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; white-space: nowrap; }
.bdl__item--on .bdl__val { color: var(--nu-blue-text); }
.bdl--escuro .bdl__item--on .bdl__val { color: var(--nu-blue-soft); }
.bdl__extra { color: var(--apoio); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; white-space: pre; text-align: right; }

/* estreito: duas linhas, o nome inteiro em cima com o número, a barra
   embaixo com o apoio à direita */
@container (max-width: 480px) {
  .bdl { --cols: 24px minmax(0, 1fr) auto; }
  .bdl--sem-num { --cols: minmax(0, 1fr) auto; }
  .bdl__l { grid-template-areas: 'pos who val' '. track extra'; row-gap: 6px; column-gap: 10px; }
  .bdl--sem-num .bdl__l { grid-template-areas: 'who val' 'track extra'; }
  .bdl__pos { grid-area: pos; }
  .bdl__who { grid-area: who; }
  .bdl__track { grid-area: track; }
  .bdl__num { display: contents; }
  .bdl__val { grid-area: val; text-align: right; }
  .bdl__extra { grid-area: extra; align-self: center; }
}
@media (prefers-reduced-motion: reduce) {
  .bdl__l, .bdl__fill { transition: none; }
}
</style>
