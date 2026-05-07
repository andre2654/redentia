<!--
  AllocationSection — donut by class + sectors bars + geography card.

  Donut "Por classe" foi redesenhado: maior, com texto central
  destacando a classe dominante, slices com gap visual entre eles,
  animação de entrada (stroke-dashoffset), hover state que destaca
  o slice + dim nos outros, legenda enriquecida com mini-bars.
-->
<template>
  <section class="flex flex-col gap-4">
    <!-- Heading "Composicao / Como sua carteira esta distribuida"
         vive em wallet/index.vue (compartilhado com PositionsTable). -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- ============ Donut por classe (NOVO DESIGN) ============ -->
      <article class="alloc-donut" :style="cardStyle">
        <header class="alloc-donut__head">
          <span class="alloc-donut__eyebrow">Por classe</span>
          <span class="alloc-donut__count">{{ byClass.length }} {{ byClass.length === 1 ? 'classe' : 'classes' }}</span>
        </header>

        <div class="alloc-donut__chart">
          <!-- Donut SVG -->
          <div class="alloc-donut__svg-wrap">
            <svg viewBox="0 0 120 120" class="alloc-donut__svg">
              <!-- Background ring (sempre cinza, sem rotacao) -->
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke-width="14"
                :stroke="bgRingColor"
              />
              <!-- Slices group: rotacao -90deg pra comecar no topo
                   (12 o'clock). Stroke-linecap=butt mantem proporcoes
                   exatas (round caps distorcem fatias pequenas).
                   v-for direto no <circle> evita wrapper desnecessario. -->
              <g transform="rotate(-90 60 60)">
                <circle
                  v-for="(slice, i) in donutSlices"
                  :key="`slice-${i}-${slice.color}`"
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke-width="14"
                  stroke-linecap="butt"
                  :stroke="slice.color"
                  :stroke-dasharray="slice.dasharray"
                  :stroke-dashoffset="slice.offset"
                  class="alloc-donut__slice"
                  :class="{
                    'alloc-donut__slice--active': hoveredIdx === i,
                    'alloc-donut__slice--dim': hoveredIdx !== null && hoveredIdx !== i,
                  }"
                  @mouseenter="hoveredIdx = i"
                  @mouseleave="hoveredIdx = null"
                />
              </g>
            </svg>

            <!-- Center text overlay -->
            <div class="alloc-donut__center">
              <span class="alloc-donut__center-label">{{ centerLabel }}</span>
              <span
                class="alloc-donut__center-value"
                :style="{ color: centerColor }"
              >{{ centerValue }}</span>
              <span class="alloc-donut__center-sub">{{ centerSub }}</span>
            </div>
          </div>

          <!-- Legenda enriquecida (color dot + name + mini-bar + %) -->
          <ul class="alloc-donut__legend">
            <li
              v-for="(row, i) in byClass"
              :key="row.label"
              class="alloc-donut__legend-row"
              :class="{
                'alloc-donut__legend-row--active': hoveredIdx === i,
                'alloc-donut__legend-row--dim': hoveredIdx !== null && hoveredIdx !== i,
              }"
              @mouseenter="hoveredIdx = i"
              @mouseleave="hoveredIdx = null"
            >
              <span
                class="alloc-donut__legend-dot"
                :style="{
                  backgroundColor: row.color,
                  boxShadow: hoveredIdx === i ? `0 0 0 2px color-mix(in srgb, ${row.color} 20%, transparent)` : 'none',
                }"
                aria-hidden="true"
              />
              <span class="alloc-donut__legend-label">{{ row.label }}</span>
              <span class="alloc-donut__legend-pct">{{ row.weight_pct.toFixed(1).replace('.', ',') }}%</span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ============ Setores (NOVO DESIGN) ============
           Barra empilhada no topo (visao macro 100%) + legenda
           rica abaixo com dots coloridos + barras individuais.
           Cada setor recebe uma cor da paleta categorica. -->
      <article class="alloc-sectors" :style="cardStyle">
        <header class="alloc-sectors__head">
          <span class="alloc-sectors__eyebrow">Por setor</span>
          <span class="alloc-sectors__count">
            {{ visibleSectors.length === sectors.length
              ? `${sectors.length} ${sectors.length === 1 ? 'setor' : 'setores'}`
              : `Top ${visibleSectors.length - (hasOthers ? 1 : 0)} de ${sectors.length}` }}
          </span>
        </header>

        <!-- Barra empilhada — visao macro 100% -->
        <div v-if="visibleSectors.length" class="alloc-sectors__stack" aria-hidden="true">
          <span
            v-for="(row, i) in visibleSectors"
            :key="`stack-${row.sector}`"
            class="alloc-sectors__stack-seg"
            :class="{
              'alloc-sectors__stack-seg--active': sectorHover === i,
              'alloc-sectors__stack-seg--dim': sectorHover !== null && sectorHover !== i,
            }"
            :style="{
              width: row.weight_pct + '%',
              backgroundColor: sectorColor(i),
            }"
            :title="`${row.sector} · ${row.weight_pct.toFixed(1)}%`"
            @mouseenter="sectorHover = i"
            @mouseleave="sectorHover = null"
          />
        </div>

        <!-- Legenda detalhada -->
        <ul v-if="visibleSectors.length" class="alloc-sectors__list">
          <li
            v-for="(row, i) in visibleSectors"
            :key="row.sector"
            class="alloc-sectors__row"
            :class="{
              'alloc-sectors__row--active': sectorHover === i,
              'alloc-sectors__row--dim': sectorHover !== null && sectorHover !== i,
            }"
            @mouseenter="sectorHover = i"
            @mouseleave="sectorHover = null"
          >
            <span
              class="alloc-sectors__dot"
              :style="{
                backgroundColor: sectorColor(i),
                boxShadow: sectorHover === i ? `0 0 0 2px color-mix(in srgb, ${sectorColor(i)} 22%, transparent)` : 'none',
              }"
              aria-hidden="true"
            />
            <span class="alloc-sectors__name" :title="row.sector">{{ row.sector }}</span>
            <span class="alloc-sectors__bar" aria-hidden="true">
              <span
                class="alloc-sectors__bar-fill"
                :style="{
                  width: Math.min(row.weight_pct * 2, 100) + '%',
                  backgroundColor: sectorColor(i),
                }"
              />
            </span>
            <span class="alloc-sectors__pct">{{ row.weight_pct.toFixed(1).replace('.', ',') }}%</span>
          </li>
        </ul>

        <p v-else class="alloc-sectors__empty">Sem dados de setor.</p>
      </article>

      <!-- ============ Geografia ============ -->
      <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
        <span class="mock-eyebrow">Geografia</span>
        <div class="flex items-baseline gap-2">
          <span
            class="font-mono-tab text-[20px] font-light tabular-nums"
            :style="{ color: brand.colors.text, letterSpacing: '-0.3px' }"
          >{{ geography.brPct.toFixed(1) }}%</span>
          <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Brasil</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span
            class="font-mono-tab text-[16px] font-light tabular-nums"
            :style="{ color: brand.colors.text, letterSpacing: '-0.2px' }"
          >{{ geography.intlPct.toFixed(1) }}%</span>
          <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Internacional<span v-if="geography.intlNote"> ({{ geography.intlNote }})</span></span>
        </div>
        <div
          class="mt-2 flex h-2 w-full overflow-hidden rounded-full"
          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
        >
          <div class="h-full" :style="{ width: geography.brPct + '%', backgroundColor: brand.colors.primary }" />
          <div class="h-full" :style="{ width: geography.intlPct + '%', backgroundColor: brand.colors.positive }" />
        </div>
        <p
          v-if="geography.note"
          class="mt-2 text-[12.5px]"
          :style="{
            color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
            lineHeight: 1.5,
          }"
        >{{ geography.note }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ClassRow {
  label: string
  value: number
  weight_pct: number
  color: string
}
interface SectorRow {
  sector: string
  value: number
  weight_pct: number
}
interface Geography {
  brPct: number
  intlPct: number
  intlNote?: string
  note?: string
}
interface Props {
  byClass: ClassRow[]
  sectors: SectorRow[]
  geography: Geography
}
const props = defineProps<Props>()

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

// Cor do anel de fundo do donut (atrás dos slices). Computed em vez
// de template literal inline pra evitar re-evaluation a cada render.
const bgRingColor = computed(
  () => `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`
)

// Donut math: r=48, circumference = 2*PI*48 ≈ 301.59 units no SVG
// 120x120. Com stroke-linecap=butt, dasharray e diretamente o tamanho
// visivel do arc.
//
// Gap entre slices: 1.5 units fixos (mais previsivel que % do circulo).
// Aplicado SO se o slice for grande o suficiente pra suportar o gap
// sem desaparecer (>= 3 units = ~1% do circulo). Slices menores
// renderizam sem gap.
//
// Quando tem so 1 classe (100%), o circulo e cheio e nao precisa
// de gap nem oferece slice secundario pra "afastar".
const CIRC = 2 * Math.PI * 48
const SLICE_GAP = 1.5

const donutSlices = computed(() => {
  if (!props.byClass.length) return []
  const single = props.byClass.length === 1
  let cumulative = 0
  const slices: { color: string; dasharray: string; offset: number }[] = []

  for (const row of props.byClass) {
    const pct = Math.max(0, Math.min(1, row.weight_pct / 100))
    const len = pct * CIRC
    // Aplica gap so se o slice tiver espaco pra cortar sem desaparecer
    // (>= 2*GAP). Single-class fica sem gap (circulo cheio).
    const gap = (single || len < SLICE_GAP * 2) ? 0 : SLICE_GAP
    const visibleLen = Math.max(0, len - gap)
    slices.push({
      color: row.color,
      dasharray: `${visibleLen} ${CIRC - visibleLen}`,
      offset: -cumulative,
    })
    cumulative += len
  }
  return slices
})

// Hover state — controla destaque do slice + da linha da legenda
const hoveredIdx = ref<number | null>(null)

// =================================================================
// Por setor — paleta categorica + agregacao "Outros"
// =================================================================
const sectorHover = ref<number | null>(null)

// Paleta categorica de 8 cores distintas. Foi escolhida pra:
//   - Ficar legivel em light/dark mode
//   - Nao colidir com brand.colors.primary (amber) nem positive/negative
//   - Cycling: o setor #9 reusa a primeira cor (raro acontecer)
const SECTOR_PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#84cc16', // lime
  '#f97316', // orange
  '#a78bfa', // light purple
] as const

function sectorColor(i: number): string {
  return SECTOR_PALETTE[i % SECTOR_PALETTE.length]!
}

const TOP_SECTOR_LIMIT = 6

// Quando ha mais setores que o limite, mostramos os top N e
// agrupamos o restante num "Outros" (pra que a stacked bar feche
// 100% e a soma faca sentido).
const visibleSectors = computed(() => {
  if (!props.sectors.length) return []
  if (props.sectors.length <= TOP_SECTOR_LIMIT) return props.sectors

  const top = props.sectors.slice(0, TOP_SECTOR_LIMIT - 1)
  const rest = props.sectors.slice(TOP_SECTOR_LIMIT - 1)
  const restValue = rest.reduce((s, r) => s + r.value, 0)
  const restPct = rest.reduce((s, r) => s + r.weight_pct, 0)

  return [
    ...top,
    {
      sector: 'Outros',
      value: restValue,
      weight_pct: restPct,
    },
  ]
})

const hasOthers = computed(
  () => props.sectors.length > TOP_SECTOR_LIMIT
)

// Center text adapta ao slice em hover ou, sem hover, mostra a
// classe dominante (maior weight_pct).
const dominantClass = computed<ClassRow | null>(() => {
  if (!props.byClass.length) return null
  return [...props.byClass].sort((a, b) => b.weight_pct - a.weight_pct)[0]
})

const focusedClass = computed<ClassRow | null>(() => {
  if (hoveredIdx.value !== null) return props.byClass[hoveredIdx.value] ?? null
  return dominantClass.value
})

const centerLabel = computed(() => {
  if (hoveredIdx.value !== null) return 'Selecionado'
  return 'Maior classe'
})

const centerValue = computed(() => {
  const c = focusedClass.value
  if (!c) return '—'
  return `${c.weight_pct.toFixed(1).replace('.', ',')}%`
})

const centerSub = computed(() => {
  const c = focusedClass.value
  if (!c) return ''
  return c.label
})

const centerColor = computed(() => focusedClass.value?.color || brand.colors.text)
</script>

<style scoped>
.mock-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ DONUT CARD (NOVO DESIGN) ============ */
.alloc-donut {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.alloc-donut::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 7%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.alloc-donut__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}

.alloc-donut__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.alloc-donut__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ CHART (svg + legend lado a lado) ============ */
.alloc-donut__chart {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
}

.alloc-donut__svg-wrap {
  position: relative;
  flex-shrink: 0;
  width: 168px;
  height: 168px;
}

.alloc-donut__svg {
  width: 100%;
  height: 100%;
  /* Filter drop-shadow removido: causava conflito de renderizacao
     em alguns browsers, com slices ficando invisiveis. Sombra agora
     vive no card pai via cardStyle. */
}

.alloc-donut__slice {
  transition: stroke-width 220ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 220ms;
  cursor: pointer;
  transform-origin: center;
}

.alloc-donut__slice--active {
  /* Sutil: so engorda o slice 2px (de 14 -> 16) e dim do resto faz
     o destaque acontecer. Sem drop-shadow glow (estava berrante). */
  stroke-width: 16;
}

.alloc-donut__slice--dim {
  opacity: 0.45;
}

/* ============ CENTER TEXT (overlay sobre SVG) ============ */
.alloc-donut__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  pointer-events: none;
  text-align: center;
}

.alloc-donut__center-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.alloc-donut__center-value {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
  transition: color 220ms;
}

.alloc-donut__center-sub {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ LEGEND ============ */
.alloc-donut__legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.alloc-donut__legend-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 6px 7px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 180ms, opacity 180ms;
}

.alloc-donut__legend-row:hover,
.alloc-donut__legend-row--active {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}

.alloc-donut__legend-row--dim {
  opacity: 0.45;
}

.alloc-donut__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transition: box-shadow 220ms;
}

.alloc-donut__legend-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.alloc-donut__legend-pct {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}

/* ============ MOBILE ============ */
@media (max-width: 640px) {
  .alloc-donut__chart {
    flex-direction: column;
    align-items: center;
  }
  .alloc-donut__svg-wrap {
    width: 144px;
    height: 144px;
  }
  .alloc-donut__legend {
    width: 100%;
  }
}

/* ============ POR SETOR (NOVO DESIGN) ============ */
.alloc-sectors {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.alloc-sectors::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, #06b6d4 6%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.alloc-sectors__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}

.alloc-sectors__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.alloc-sectors__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ STACKED BAR (visao macro 100%) ============ */
.alloc-sectors__stack {
  display: flex;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  gap: 1.5px;
  padding: 0;
  position: relative;
}

.alloc-sectors__stack-seg {
  height: 100%;
  transition: opacity 200ms, transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 1px;
}

.alloc-sectors__stack-seg:first-child {
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}

.alloc-sectors__stack-seg:last-child {
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.alloc-sectors__stack-seg--active {
  transform: scaleY(1.5);
}

.alloc-sectors__stack-seg--dim {
  opacity: 0.45;
}

/* ============ LIST ============ */
.alloc-sectors__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.alloc-sectors__row {
  display: grid;
  grid-template-columns: 10px 1fr 70px 48px;
  align-items: center;
  gap: 10px;
  padding: 6px 7px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 180ms, opacity 180ms;
}

.alloc-sectors__row:hover,
.alloc-sectors__row--active {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}

.alloc-sectors__row--dim {
  opacity: 0.5;
}

.alloc-sectors__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transition: box-shadow 220ms;
}

.alloc-sectors__name {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.alloc-sectors__bar {
  display: block;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  position: relative;
}

.alloc-sectors__bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.alloc-sectors__pct {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  font-weight: 600;
  text-align: right;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}

.alloc-sectors__empty {
  margin: 0;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
</style>
