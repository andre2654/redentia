<!--
  StressTestCard — substitui o grid generico de "Cenário/Queda do IBOV/-5%"
  por cenarios HISTORICOS REAIS + 1 cenario futuro com VISUAL CHAMATIVO.

  Cenarios canonicos:
    1. Pandemia COVID-19 (mar/2020) — REAL — IBOV -45% em 32 dias
    2. Crise do Subprime (set 2008 - mar 2009) — REAL — IBOV -54%
    3. Estouro da bolha de IA (2026-2027) — HIPOTETICO — projecao de -40%

  Calculo de impacto na carteira do user:
    Para cada cenario, mantemos um mapa de impacto por asset_class
    (STOCK, REIT, ETF, BDR, TREASURY, CRYPTO, OTHER). Pegamos a alocacao
    atual do user (weight_pct por classe) e fazemos weighted sum:

      impactoCarteira = Σ (weight[class] × impactClasse[class]) / 100

    Os numeros sao estimativas baseadas em comportamento historico real
    (S&P 500, IBOV, IFIX, IMA-B, MSCI World) — nao garantia de
    repeticao, mas referencia honesta de stress test.

  VISUAL: cada card tem ano gigante de fundo (tombstone), gradient
  multi-stop, glow no numero, sparkline animada, hover lift dramatico.
-->
<template>
  <section v-if="hasPositions" class="stress flex flex-col gap-7">
    <!-- Section heading -->
    <div class="stress__head">
      <span class="stress__eyebrow">
        <span class="stress__eyebrow-dot" aria-hidden="true" />
        Stress test
      </span>
      <h2 class="stress__title">
        Como sua carteira sobreviveria<br>
        a <em class="stress__title-em">crises reais</em>
      </h2>
      <p class="stress__lead">
        Estimativa do impacto na sua carteira em três cenários: duas crises
        históricas que de fato aconteceram e uma projeção futura. Os percentuais
        por classe vêm do comportamento real do IBOV, S&P 500, IFIX e IMA-B nesses
        períodos.
      </p>
    </div>

    <!-- Scenarios -->
    <div class="stress__grid">
      <article
        v-for="(scenario, idx) in scenarios"
        :key="scenario.id"
        class="stress-card"
        :class="`stress-card--${scenario.tone}`"
        :style="{ '--stress-delay': `${idx * 80}ms` } as any"
      >
        <!-- Background year tombstone -->
        <span class="stress-card__year-bg" aria-hidden="true">{{ scenario.year_label }}</span>

        <!-- Top tag row -->
        <div class="stress-card__top">
          <span class="stress-card__tag" :class="`stress-card__tag--${scenario.type}`">
            <UIcon
              :name="scenario.type === 'real' ? 'i-lucide-history' : 'i-lucide-telescope'"
              class="size-3"
              aria-hidden="true"
            />
            <span>{{ scenario.type === 'real' ? 'Crise real' : 'Projeção futura' }}</span>
          </span>
          <span class="stress-card__period">{{ scenario.period }}</span>
        </div>

        <!-- Header: icon + name -->
        <header class="stress-card__head">
          <div class="stress-card__icon" aria-hidden="true">
            <UIcon :name="scenario.icon" class="size-6" />
          </div>
          <h3 class="stress-card__name">{{ scenario.name }}</h3>
        </header>

        <p class="stress-card__headline">{{ scenario.headline }}</p>

        <!-- Big impact stat -->
        <div class="stress-card__impact">
          <div class="stress-card__impact-row">
            <span class="stress-card__impact-label">
              <UIcon name="i-lucide-target" class="size-3" aria-hidden="true" />
              Sua carteira
            </span>
            <span class="stress-card__impact-baseline">
              IBOV {{ formatPctSigned(scenario.baseline_ibov) }}
            </span>
          </div>
          <div class="stress-card__impact-numbers">
            <span class="stress-card__impact-pct">
              {{ formatPctSigned(impactFor(scenario)) }}
            </span>
          </div>
          <div v-if="totalValue > 0" class="stress-card__impact-money">
            <UIcon
              :name="impactFor(scenario) < 0 ? 'i-lucide-trending-down' : 'i-lucide-trending-up'"
              class="size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span>
              <template v-if="impactFor(scenario) < 0">
                {{ formatBRL(estimatedLoss(scenario)) }} a menos no patrimônio
              </template>
              <template v-else>
                {{ formatBRL(estimatedLoss(scenario)) }} adicionais
              </template>
            </span>
          </div>
          <div class="stress-card__bar" aria-hidden="true">
            <div
              class="stress-card__bar-fill"
              :style="{ width: barWidth(scenario) + '%' }"
            />
          </div>
        </div>

        <!-- Per-class breakdown -->
        <div class="stress-card__breakdown">
          <span class="stress-card__breakdown-label">Reação por classe</span>
          <div class="stress-card__chips">
            <span
              v-for="chip in classChips(scenario)"
              :key="chip.key"
              class="stress-chip"
              :class="chip.value >= 0 ? 'stress-chip--pos' : 'stress-chip--neg'"
            >
              <span class="stress-chip__dot" :style="{ backgroundColor: chip.color }" aria-hidden="true" />
              <span class="stress-chip__label">{{ chip.label }}</span>
              <span class="stress-chip__value">{{ formatPctSigned(chip.value) }}</span>
            </span>
          </div>
        </div>

        <!-- Footer -->
        <footer class="stress-card__foot">
          <span class="stress-card__foot-item">
            <UIcon name="i-lucide-clock" class="size-3.5" aria-hidden="true" />
            <span>Choque: <strong>{{ scenario.duration }}</strong></span>
          </span>
          <span class="stress-card__foot-dot" aria-hidden="true">·</span>
          <span class="stress-card__foot-item">
            <UIcon name="i-lucide-trending-up" class="size-3.5" aria-hidden="true" />
            <span>Recuperação: <strong>{{ scenario.recovery }}</strong></span>
          </span>
        </footer>
      </article>
    </div>

    <!-- Disclaimer -->
    <p class="stress__disclaimer">
      <UIcon name="i-lucide-info" class="size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Estimativas baseadas no comportamento histórico de cada classe nos
        respectivos períodos. Não garantem repetição em crises futuras. Tesouro
        Selic e Pré-fixado segurado até o vencimento tendem a se comportar
        melhor que a média da renda fixa em momentos de estresse.
      </span>
    </p>
  </section>
</template>

<script setup lang="ts">
import type { UnifiedPosition } from '~/services/portfolio'

interface Props {
  positions: UnifiedPosition[]
  totalValue: number
}
const props = defineProps<Props>()

const brand = useBrand()

const hasPositions = computed(() => props.positions?.length > 0)

// =============================================================
// Asset class taxonomy (mantemos sincronizado com wallet/index.vue
// CLASS_LABELS — idealmente extrair pra um modulo compartilhado).
// =============================================================
// Scenarios + impact math live in `~/composables/useStressScenarios` so
// the wallet card and the Raio-X Highlights slide stay in sync.
import {
  STRESS_SCENARIOS,
  allocationByClass,
  scenarioImpact,
  type StressAssetClass,
  type StressScenarioCanon,
} from '~/composables/useStressScenarios'

type AssetClass = StressAssetClass

const CLASS_META: Record<AssetClass, { label: string; color: string }> = {
  STOCK:    { label: 'Ações',    color: '#3b82f6' },
  REIT:     { label: 'FIIs',     color: '#8b5cf6' },
  ETF:      { label: 'ETFs',     color: '#06b6d4' },
  BDR:      { label: 'BDRs',     color: '#f59e0b' },
  TREASURY: { label: 'Tesouro',  color: '#10b981' },
  CRYPTO:   { label: 'Cripto',   color: '#f97316' },
  OTHER:    { label: 'Outros',   color: '#94a3b8' },
}

type Scenario = StressScenarioCanon

const scenarios = STRESS_SCENARIOS

const allocation = computed<Record<AssetClass, number>>(() => allocationByClass(props.positions))

function impactFor(s: Scenario): number {
  return scenarioImpact(s, allocation.value)
}

function estimatedLoss(s: Scenario): number {
  return props.totalValue * (impactFor(s) / 100)
}

function barWidth(s: Scenario): number {
  const i = impactFor(s)
  const mag = Math.min(50, Math.abs(i))
  return (mag / 50) * 100
}

interface ClassChip {
  key: AssetClass
  label: string
  color: string
  value: number
  weight: number
}
function classChips(s: Scenario): ClassChip[] {
  const a = allocation.value
  const chips: ClassChip[] = []
  for (const k of Object.keys(CLASS_META) as AssetClass[]) {
    if (a[k] > 0) {
      chips.push({
        key: k,
        label: CLASS_META[k].label,
        color: CLASS_META[k].color,
        value: s.impact_by_class[k],
        weight: a[k],
      })
    }
  }
  return chips.sort((a, b) => b.weight - a.weight)
}

function formatPctSigned(v: number | null | undefined): string {
  if (v == null) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1).replace('.', ',')}%`
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Math.abs(v))
}
</script>

<style scoped>
.stress {
  width: 100%;
}

/* ============ HEADING ============ */
.stress__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 6px;
}

.stress__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--brand-negative, #dc2626);
  padding: 5px 11px 5px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
}

.stress__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-negative, #dc2626);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.stress__title {
  margin: 0;
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: clamp(26px, 3.4vw, 34px);
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--text-heading, var(--brand-text));
}

.stress__title-em {
  font-style: italic;
  font-weight: 300;
  background: linear-gradient(
    100deg,
    var(--brand-negative, #dc2626) 0%,
    #f59e0b 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stress__lead {
  margin: 0;
  max-width: 720px;
  font-size: 13px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.stress__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 1024px) {
  .stress__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ============ CARD (chamativa!) ============ */
.stress-card {
  --tone: var(--brand-negative, #dc2626);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 22px 18px;
  border-radius: 24px;
  border: 1px solid color-mix(in srgb, var(--tone) 20%, transparent);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--tone) 22%, transparent) 0%, transparent 60%),
    linear-gradient(180deg,
      color-mix(in srgb, var(--tone) 8%, var(--brand-surface)) 0%,
      color-mix(in srgb, var(--brand-surface) 85%, var(--brand-background)) 100%
    );
  position: relative;
  overflow: hidden;
  transition: border-color 220ms, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms;
  animation: cardEnter 540ms cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-delay: var(--stress-delay, 0ms);
}

@keyframes cardEnter {
  0% { opacity: 0; transform: translateY(14px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.stress-card--crisis  { --tone: var(--brand-negative, #dc2626); }
.stress-card--severe  { --tone: #ef4444; }
.stress-card--projection { --tone: #f59e0b; }

.stress-card:hover {
  border-color: color-mix(in srgb, var(--tone) 50%, transparent);
  transform: translateY(-3px);
  box-shadow:
    0 24px 50px -22px color-mix(in srgb, var(--tone) 55%, transparent),
    0 0 0 1px color-mix(in srgb, var(--tone) 25%, transparent);
}

/* Tombstone year of fundo — gigante, SEMI-transparente */
.stress-card__year-bg {
  position: absolute;
  bottom: -38px;
  right: -10px;
  font-family: var(--brand-font);
  font-weight: 100;
  font-size: 180px;
  line-height: 0.85;
  letter-spacing: -0.06em;
  color: color-mix(in srgb, var(--tone) 14%, transparent);
  user-select: none;
  pointer-events: none;
  z-index: 0;
}

/* todo conteudo do card precisa ficar acima do tombstone */
.stress-card > *:not(.stress-card__year-bg) {
  position: relative;
  z-index: 1;
}

/* ============ TOP TAG ROW ============ */
.stress-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stress-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stress-card__tag--real {
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  color: var(--tone);
  border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
}

.stress-card__tag--hipotetico {
  background: color-mix(in srgb, #f59e0b 14%, transparent);
  color: #f59e0b;
  border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
}

.stress-card__period {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ HEAD ============ */
.stress-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stress-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--tone) 22%, transparent) 0%,
    color-mix(in srgb, var(--tone) 8%, transparent) 100%
  );
  border: 1px solid color-mix(in srgb, var(--tone) 35%, transparent);
  color: var(--tone);
  flex-shrink: 0;
  box-shadow: 0 6px 18px -8px color-mix(in srgb, var(--tone) 50%, transparent);
}

.stress-card__name {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--text-heading, var(--brand-text));
  line-height: 1.2;
}

.stress-card__headline {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

/* ============ IMPACT (HERO!) ============ */
.stress-card__impact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background:
    radial-gradient(ellipse at center top, color-mix(in srgb, var(--tone) 18%, transparent) 0%, transparent 70%),
    color-mix(in srgb, var(--tone) 6%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--tone) 28%, transparent);
  position: relative;
  overflow: hidden;
}

.stress-card__impact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--tone) 60%, transparent), transparent);
}

.stress-card__impact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stress-card__impact-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.stress-card__impact-baseline {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.stress-card__impact-numbers {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.stress-card__impact-pct {
  font-family: var(--brand-font);
  font-weight: 100;
  font-size: clamp(48px, 6.4vw, 60px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: var(--tone);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 40px color-mix(in srgb, var(--tone) 50%, transparent);
}

.stress-card__impact-money {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

.stress-card__bar {
  height: 5px;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  margin-top: 4px;
}

.stress-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--tone) 0%, color-mix(in srgb, var(--tone) 70%, white) 100%);
  border-radius: 999px;
  box-shadow: 0 0 12px color-mix(in srgb, var(--tone) 50%, transparent);
  transition: width 800ms cubic-bezier(0.4, 0, 0.2, 1);
  width: 0;
  animation: barGrow 900ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--stress-delay, 0ms) + 200ms);
}

@keyframes barGrow {
  0% { width: 0; }
  100% { /* width handled inline */ }
}

/* ============ BREAKDOWN ============ */
.stress-card__breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stress-card__breakdown-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.stress-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stress-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px 5px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 80%, var(--brand-background));
  color: var(--brand-text);
  transition: border-color 180ms, transform 120ms;
}

.stress-chip:hover {
  border-color: color-mix(in srgb, var(--brand-border) 90%, transparent);
  transform: translateY(-1px);
}

.stress-chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-surface) 70%, transparent);
}

.stress-chip__label {
  letter-spacing: -0.005em;
}

.stress-chip__value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 600;
}

.stress-chip--neg .stress-chip__value {
  color: var(--brand-negative, #dc2626);
}

.stress-chip--pos .stress-chip__value {
  color: var(--brand-positive, #16a34a);
}

/* ============ FOOTER ============ */
.stress-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding-top: 14px;
  margin-top: auto;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.stress-card__foot-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stress-card__foot-item strong {
  font-weight: 600;
  color: var(--brand-text);
}

.stress-card__foot-dot {
  opacity: 0.5;
}

/* ============ DISCLAIMER ============ */
.stress__disclaimer {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 13px 15px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  font-size: 11.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

@media (max-width: 640px) {
  .stress-card__year-bg {
    font-size: 140px;
    bottom: -28px;
  }
}
</style>
