<!--
  MoleculesRaioXLockedPreview — secoes blureadas pos soft gate.

  USADO EM:
  /raio-x?tickers=... apos o MoleculesRaioXSoftGate, antes do
  MoleculesRaioXAssessorCTA. Reforca "tem mais conteudo se cadastrar"
  com 4 mini-secoes blureadas (calendario, eventos, benchmarks,
  alocacao por classe).

  ESTRATEGIA:
  Pessoa ja viu o cadastro form. Se ela nao cadastrou ainda, esses
  cards blureados criam mais um momento de "olha o que voce ta perdendo"
  antes de chegar no Assessor CTA. Cada card mostra TITULO claro + dados
  blureados + cadeado.

  PROPS:
  report: PortfolioReport — usa dados reais pra montar os previews
  (mesmo que blureados, sao numeros verdadeiros do user).
-->
<script setup lang="ts">
import type { PortfolioReport } from '~/composables/usePortfolioScore'

const props = defineProps<{
  report: PortfolioReport
}>()

const brand = useBrand()

// Calendario de dividendos preview (4 meses)
const calendarMonths = computed(() => {
  const months = props.report.dividendForecast || []
  if (months.length > 0) {
    return months.slice(0, 4).map(m => ({
      month: m.month || '●●● 2026',
      amount: m.amount || 0,
    }))
  }
  // Fallback se nao houver dividendForecast
  return [
    { month: 'Mai 2026', amount: 320 },
    { month: 'Jun 2026', amount: 180 },
    { month: 'Jul 2026', amount: 410 },
    { month: 'Ago 2026', amount: 290 },
  ]
})

// Eventos preview (3 itens)
const eventPreviews = computed(() => {
  const events = props.report.events || []
  if (events.length > 0) {
    return events.slice(0, 3).map(e => ({
      title: e.title || 'Evento de mercado relevante',
      date: e.date || 'há 2 dias',
    }))
  }
  return [
    { title: 'PETR4: dividendo extraordinário anunciado', date: 'há 2 dias' },
    { title: 'IBOV: queda de 1.8% na sessão', date: 'há 5 dias' },
    { title: 'Selic: nova projeção do COPOM', date: 'há 1 semana' },
  ]
})

// Alocacao por classe (3 maiores)
const allocByClass = computed(() => {
  const alloc = props.report.allocationByClass || []
  if (alloc.length > 0) {
    return alloc.slice(0, 4).map(a => ({
      label: a.label || a.class || 'Classe',
      pct: Math.round((a.weight || 0) * 100),
    }))
  }
  return [
    { label: 'Ações BR', pct: 40 },
    { label: 'FIIs', pct: 30 },
    { label: 'Renda Fixa', pct: 20 },
    { label: 'Internacional', pct: 10 },
  ]
})

const benchmarksPreview = computed(() => {
  const bench = props.report.benchmarks || []
  if (bench.length > 0) {
    return bench.slice(0, 4).map(b => ({
      label: b.label || 'Benchmark',
      value: b.expected || 0,
    }))
  }
  return [
    { label: 'Sua carteira', value: 13.0 },
    { label: 'CDI', value: 11.0 },
    { label: 'IBOV', value: 9.5 },
    { label: 'IFIX', value: 12.2 },
  ]
})

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})
</script>

<template>
  <section class="rx-locked">
    <header class="rx-locked__header">
      <p class="eyebrow">CONTEÚDO LIBERADO COM CADASTRO</p>
      <h2 class="rx-locked__title">
        Tem
        <em :style="{ color: brand.colors.primary, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }">
          muito mais
        </em>
        pra explorar
      </h2>
    </header>

    <!-- Container blureado — 4 cards em grid 2x2 -->
    <div class="rx-locked__wrap">
      <div class="rx-locked__grid" aria-hidden="true">
        <!-- 1. Calendário de dividendos -->
        <article class="rx-locked__card">
          <header class="rx-locked__card-head">
            <UIcon name="i-lucide-calendar-days" class="size-4" :style="{ color: brand.colors.primary }" />
            <span class="eyebrow">Calendário de dividendos</span>
          </header>
          <div class="rx-locked__calendar-list">
            <div
              v-for="(m, idx) in calendarMonths"
              :key="idx"
              class="rx-locked__calendar-row"
            >
              <span class="rx-locked__calendar-month">{{ m.month }}</span>
              <span class="rx-locked__calendar-value">{{ fmtBRL(m.amount) }}</span>
            </div>
          </div>
        </article>

        <!-- 2. Eventos do mercado -->
        <article class="rx-locked__card">
          <header class="rx-locked__card-head">
            <UIcon name="i-lucide-newspaper" class="size-4" :style="{ color: brand.colors.primary }" />
            <span class="eyebrow">Eventos do mercado</span>
          </header>
          <ul class="rx-locked__events-list">
            <li
              v-for="(ev, idx) in eventPreviews"
              :key="idx"
              class="rx-locked__event-row"
            >
              <span class="rx-locked__event-dot" :style="{ background: brand.colors.primary }" />
              <div class="rx-locked__event-content">
                <span class="rx-locked__event-title">{{ ev.title }}</span>
                <span class="rx-locked__event-date">{{ ev.date }}</span>
              </div>
            </li>
          </ul>
        </article>

        <!-- 3. Comparação com benchmarks -->
        <article class="rx-locked__card">
          <header class="rx-locked__card-head">
            <UIcon name="i-lucide-bar-chart-3" class="size-4" :style="{ color: brand.colors.primary }" />
            <span class="eyebrow">vs Benchmarks</span>
          </header>
          <div class="rx-locked__bench-list">
            <div
              v-for="(b, idx) in benchmarksPreview"
              :key="idx"
              class="rx-locked__bench-row"
            >
              <span class="rx-locked__bench-label">{{ b.label }}</span>
              <div class="rx-locked__bench-bar-wrap">
                <div
                  class="rx-locked__bench-bar"
                  :style="{
                    width: `${Math.min(100, (b.value / 15) * 100)}%`,
                    background: idx === 0 ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
                  }"
                />
              </div>
              <span class="rx-locked__bench-value">{{ b.value.toFixed(1) }}%</span>
            </div>
          </div>
        </article>

        <!-- 4. Alocação por classe -->
        <article class="rx-locked__card">
          <header class="rx-locked__card-head">
            <UIcon name="i-lucide-pie-chart" class="size-4" :style="{ color: brand.colors.primary }" />
            <span class="eyebrow">Alocação por classe</span>
          </header>
          <div class="rx-locked__alloc-list">
            <div
              v-for="(c, idx) in allocByClass"
              :key="idx"
              class="rx-locked__alloc-row"
            >
              <span class="rx-locked__alloc-label">{{ c.label }}</span>
              <div class="rx-locked__alloc-bar-wrap">
                <div
                  class="rx-locked__alloc-bar"
                  :style="{
                    width: `${c.pct}%`,
                    background: `color-mix(in srgb, ${brand.colors.primary} ${60 - idx * 10}%, transparent)`,
                  }"
                />
              </div>
              <span class="rx-locked__alloc-pct">{{ c.pct }}%</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Overlay com cadeado -->
      <div class="rx-locked__overlay">
        <div class="rx-locked__lock-icon" aria-hidden="true">
          <UIcon name="i-lucide-lock-keyhole" class="size-8" :style="{ color: brand.colors.primary }" />
        </div>
        <p class="rx-locked__cta">
          Calendário de dividendos, eventos do mercado, comparação com benchmarks e mais.
        </p>
        <p class="rx-locked__hint">
          ↑ Cadastra grátis acima pra desbloquear tudo
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rx-locked {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px 0;
}

.rx-locked__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0;
}

.rx-locked__title {
  font-family: var(--brand-font);
  font-size: 26px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
}

@media (min-width: 768px) {
  .rx-locked__title { font-size: 32px; }
}

/* ============ CONTAINER BLUREADO ============ */
.rx-locked__wrap {
  position: relative;
  /* Container limita altura visual mas o conteudo blureado renderiza
     completo por baixo — mask-image cria fade no fim. */
  max-height: 540px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 55%, transparent 100%);
          mask-image: linear-gradient(180deg, #000 0%, #000 55%, transparent 100%);
}

.rx-locked__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  filter: blur(6px) brightness(0.92);
  opacity: 0.65;
  pointer-events: none;
  user-select: none;
}

@media (min-width: 768px) {
  .rx-locked__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

.rx-locked__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
}

.rx-locked__card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
}

/* ============ CALENDARIO ============ */
.rx-locked__calendar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rx-locked__calendar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.rx-locked__calendar-month {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-heading);
}

.rx-locked__calendar-value {
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--brand-primary);
}

/* ============ EVENTOS ============ */
.rx-locked__events-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rx-locked__event-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rx-locked__event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.rx-locked__event-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rx-locked__event-title {
  font-size: 13px;
  line-height: 1.4;
  font-weight: 500;
  color: var(--text-heading);
}

.rx-locked__event-date {
  font-size: 11px;
  color: var(--text-muted);
}

/* ============ BENCHMARKS ============ */
.rx-locked__bench-list,
.rx-locked__alloc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rx-locked__bench-row,
.rx-locked__alloc-row {
  display: grid;
  grid-template-columns: 90px 1fr 50px;
  gap: 10px;
  align-items: center;
}

.rx-locked__bench-label,
.rx-locked__alloc-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-heading);
}

.rx-locked__bench-bar-wrap,
.rx-locked__alloc-bar-wrap {
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
}

.rx-locked__bench-bar,
.rx-locked__alloc-bar {
  height: 100%;
  border-radius: inherit;
}

.rx-locked__bench-value,
.rx-locked__alloc-pct {
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  text-align: right;
}

/* ============ OVERLAY (cadeado central) ============ */
.rx-locked__overlay {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 22px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  box-shadow:
    0 16px 40px -12px color-mix(in srgb, var(--brand-primary) 25%, transparent),
    0 8px 22px -10px rgba(0, 0, 0, 0.18);
  text-align: center;
  max-width: 460px;
  width: calc(100% - 48px);
  z-index: 2;
}

.rx-locked__lock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
}

.rx-locked__cta {
  font-family: var(--brand-font);
  font-size: 14px;
  line-height: 1.45;
  font-weight: 500;
  color: var(--text-heading);
  margin: 0;
}

.rx-locked__hint {
  font-size: 12px;
  color: var(--brand-primary);
  font-weight: 600;
  margin: 0;
}
</style>
