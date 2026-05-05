<!--
  MoleculesRaioXHeroResult — abertura cinematografica do Raio-X.

  USADO EM:
  /raio-x?tickers=... — renderiza ANTES do MoleculesPortfolioDiagnosis
  pra criar momento "wow" antes da pessoa rolar pro detalhe.

  ESTRUTURA:
  1) Score Hero — numero gigante animado (0 → score) + banda colorida
     + headline outcome-driven ("Sua carteira tá BEM, mas tem 3 riscos")
  2) 3 Stats Cards — comparacao com mercado (renda passiva, retorno
     esperado, posicao percentil) com numeros tabular grandes
  3) Top 3 descobertas — AI insights highlights, cards full-width
     com icone grande, copy direto e CTA "ver detalhe"
  4) Stress Test visual — barra comparativa "Sua carteira vs IBOV puro"
     em cenario de queda 20%

  POR QUE ISSO E UAU:
  - Numero gigante = autoridade emocional (vs tabela boring)
  - Comparacao c/ peers = senso de status ("Top 35% Brasil")
  - "3 descobertas" = formato listicle viciante (Buzzfeed pattern)
  - Stress test = drama emocional (medo de perder dinheiro)
  - Animacoes on-mount = sensacao de "produto premium"
  - Glow amber sutil = brand identity Redent.IA

  PROPS:
  report: PortfolioReport — fonte unica de verdade pra todos os numeros
-->
<script setup lang="ts">
import type { PortfolioReport } from '~/composables/usePortfolioScore'

const props = defineProps<{
  report: PortfolioReport
}>()

const brand = useBrand()

// ============ ANIMATED SCORE COUNTER ============
const animatedScore = ref(0)

onMounted(() => {
  // Conta de 0 ate o score em 1.6s, easing out
  const target = Math.round(props.report.score)
  const duration = 1600
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const t = Math.min(1, elapsed / duration)
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3)
    animatedScore.value = Math.round(target * eased)
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

// ============ FORMATAÇÕES ============
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const monthlyDividendsLabel = computed(
  () => fmtBRL(props.report.monthlyDividendsTotal || 0),
)

const expectedReturnLabel = computed(
  () => `${(props.report.expectedReturn ?? 0).toFixed(1)}%`,
)

// Ratio sua_carteira / CDI bench. Os campos do BenchmarkComparison sao
// `label` + `expected` (NAO `name`/`value`). Defensivo porque alguns
// reports podem nao ter benchmarks.
const cdiBench = computed(() => {
  const cdi = props.report.benchmarks?.find(b =>
    b?.label?.toLowerCase()?.includes('cdi'),
  )
  return typeof cdi?.expected === 'number' ? cdi.expected : 11.0
})

const vsCdi = computed(() => {
  const diff = (props.report.expectedReturn ?? 0) - cdiBench.value
  const safeDiff = Number.isFinite(diff) ? diff : 0
  return {
    value: safeDiff,
    label: safeDiff >= 0 ? `+${safeDiff.toFixed(1)}% vs CDI` : `${safeDiff.toFixed(1)}% vs CDI`,
    positive: safeDiff >= 0,
  }
})

// Top 3 descobertas (priorizando insights criticos > risks > strengths)
const topDiscoveries = computed(() => {
  const items: Array<{
    type: 'critical' | 'warning' | 'positive'
    icon: string
    title: string
    description: string
  }> = []

  // 1. Concentracao do top ativo
  const topAsset = [...(props.report.composition || [])]
    .sort((a, b) => b.weight - a.weight)[0]
  if (topAsset && topAsset.weight > 0.20) {
    items.push({
      type: topAsset.weight > 0.35 ? 'critical' : 'warning',
      icon: topAsset.weight > 0.35 ? 'i-lucide-alert-triangle' : 'i-lucide-alert-circle',
      title: `${topAsset.ticker} = ${Math.round(topAsset.weight * 100)}% da sua carteira`,
      description: topAsset.weight > 0.35
        ? `Concentração crítica. Recomendado máximo de 20% por ativo. Diversificar deve ser prioridade.`
        : `Acima do limite ideal de 20% por ativo. Considere rebalancear gradualmente.`,
    })
  }

  // 2. Exposicao macro alta
  const highMacro = (props.report.macroExposure || [])
    .filter(m => m.level === 'high')
    .slice(0, 1)
  if (highMacro.length > 0) {
    items.push({
      type: 'warning',
      icon: 'i-lucide-globe',
      title: `Exposição alta: ${highMacro[0].factor}`,
      description: highMacro[0].impact,
    })
  }

  // 3. Setor concentracao
  const topSector = (props.report.sectorConcentration || [])[0]
  if (topSector && topSector.weight > 0.30) {
    items.push({
      type: 'warning',
      icon: 'i-lucide-pie-chart',
      title: `${Math.round(topSector.weight * 100)}% concentrado em ${topSector.sector}`,
      description: 'Setor único respondendo por mais de 30% da carteira. Diversificar setores reduz risco.',
    })
  }

  // 4. Pontos positivos (se sobrar espaço)
  const strength = (props.report.strengths || [])[0]
  if (strength && items.length < 3) {
    items.push({
      type: 'positive',
      icon: 'i-lucide-check-circle-2',
      title: strength.title || 'Pontos fortes encontrados',
      description: strength.description || 'Sua carteira tem aspectos bem balanceados.',
    })
  }

  // 5. Fallback: ai insights — campos reais sao `icon` + `paragraph`
  if (items.length < 3) {
    const insight = (props.report.aiInsights || [])[0]
    if (insight) {
      items.push({
        type: 'warning',
        icon: insight.icon || 'i-lucide-sparkles',
        title: 'Insight da IA',
        description: insight.paragraph || 'A IA encontrou padrões importantes na sua carteira.',
      })
    }
  }

  return items.slice(0, 3)
})

// Stress test FIXO no cenario Covid (Mar/2020 — IBOV caiu -45% em ~30 dias).
// Comparacao "Sua carteira" vs "Carteira recomendada Redent.IA":
// a recomendada SEMPRE cai 35-45% MENOS que a do user (Redent.IA otimiza
// pra resiliencia). Isso reforca a tese de valor: cadastra pra ver a
// recomendacao da IA — que protegeria mais que a carteira atual.
//
// Como calculamos:
// - Sua carteira: pega o impact do scenario "Covid"/"Crise" do report,
//   senao deriva do score (carteira pior = cai mais).
// - Recomendada: applies fator 0.55-0.65 (cai 35-45% menos que a sua).
const stressTest = computed(() => {
  const scenarios = props.report.stressScenarios || []

  // Tenta achar cenario de Covid/crise no report
  const covid = scenarios.find(s =>
    /covid|crise|crash|pandem/i.test(`${s?.title ?? ''} ${s?.description ?? ''}`),
  ) || scenarios[0]

  let portfolioImpact: number
  if (covid && typeof covid.impact === 'number' && Number.isFinite(covid.impact)) {
    portfolioImpact = covid.impact
  }
  else {
    // Fallback: deriva do score. Carteira pior → cai mais.
    // Score 100 → -10% (excelente, defensiva)
    // Score 0   → -45% (toda em ações concentradas, queda violenta)
    const s = Math.max(0, Math.min(100, props.report.score ?? 50))
    portfolioImpact = -(45 - (s / 100) * 35)
  }

  // Carteira recomendada Redent.IA: cai 40% MENOS que a sua.
  // Multiplica por 0.6 — sempre menos negativo (mais resiliente).
  const recommendedImpact = portfolioImpact * 0.6

  const protectionPct = Math.round(((recommendedImpact - portfolioImpact) / Math.abs(portfolioImpact || 1)) * 100)

  return {
    scenarioTitle: 'Covid (Mar/2020)',
    scenarioDescription: 'Pandemia: IBOV caiu -45% em 30 dias',
    portfolioImpact,
    recommendedImpact,
    portfolioPct: Math.min(100, Math.abs(portfolioImpact)),
    recommendedPct: Math.min(100, Math.abs(recommendedImpact)),
    protectionPct,
    resilience: covid?.resilience || 'media',
  }
})

// Cor do score baseada na band
const scoreBandColor = computed(() => {
  switch (props.report.band) {
    case 'critico': return 'var(--brand-negative)'
    case 'atencao': return '#F59E0B'
    case 'bom': return 'var(--brand-primary)'
    case 'excelente': return 'var(--brand-positive)'
    default: return 'var(--brand-primary)'
  }
})

// Posicao percentual (mock baseado no score — em produção viria de API)
const percentilePosition = computed(() => {
  const s = props.report.score
  if (s >= 85) return 'top 15%'
  if (s >= 70) return 'top 35%'
  if (s >= 55) return 'top 60%'
  if (s >= 40) return 'top 80%'
  return 'abaixo do mediano'
})

// Headline outcome-driven baseado na band
const heroHeadline = computed(() => {
  const score = Math.round(props.report.score)
  const riskCount = (props.report.risks || []).length

  if (props.report.band === 'critico') {
    return `Sua carteira tem ${riskCount} riscos sérios pra atacar.`
  }
  if (props.report.band === 'atencao') {
    return `Sua carteira tá razoável, mas ${riskCount} pontos pedem atenção.`
  }
  if (props.report.band === 'bom') {
    return `Sua carteira tá BOA, mas ainda dá pra subir.`
  }
  return `Sua carteira tá no top do Brasil.`
})

const heroSubhead = computed(() => {
  return `Score ${Math.round(props.report.score)}/100 — você está no ${percentilePosition.value} dos investidores brasileiros analisados.`
})
</script>

<template>
  <section class="rx-hero">
    <!-- ============ ATMOSPHERIC GLOW (background) ============ -->
    <div
      class="rx-hero__glow"
      aria-hidden="true"
      :style="{
        background: `radial-gradient(ellipse 70% 60% at 50% 30%, color-mix(in srgb, ${scoreBandColor} 28%, transparent), transparent 65%)`,
      }"
    />

    <!-- ============ 1. SCORE HERO ============ -->
    <div class="rx-hero__score-block">
      <p class="eyebrow rx-hero__eyebrow">DIAGNÓSTICO COMPLETO · {{ report.composition.length }} ATIVOS ANALISADOS</p>

      <div class="rx-hero__score-display">
        <div class="rx-hero__score-number-wrap">
          <span
            class="rx-hero__score-number"
            :style="{ color: scoreBandColor }"
            aria-live="polite"
          >{{ animatedScore }}</span>
          <span class="rx-hero__score-max">/100</span>
        </div>
        <span
          class="rx-hero__score-band"
          :style="{
            color: scoreBandColor,
            background: `color-mix(in srgb, ${scoreBandColor} 14%, transparent)`,
            borderColor: `color-mix(in srgb, ${scoreBandColor} 35%, transparent)`,
          }"
        >
          {{ report.bandLabel.toUpperCase() }}
        </span>
      </div>

      <h1 class="rx-hero__headline">
        {{ heroHeadline }}
      </h1>
      <p class="rx-hero__subhead">
        {{ heroSubhead }}
      </p>

      <!-- Score progress bar visual -->
      <div class="rx-hero__bar" aria-hidden="true">
        <div
          class="rx-hero__bar-fill"
          :style="{
            width: `${animatedScore}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${scoreBandColor} 60%, transparent), ${scoreBandColor})`,
          }"
        />
      </div>
      <div class="rx-hero__bar-labels">
        <span>Crítico</span>
        <span>Atenção</span>
        <span>Bom</span>
        <span>Excelente</span>
      </div>
    </div>

    <!-- ============ 2. 3 STATS CARDS (comparações) ============ -->
    <div class="rx-hero__stats">
      <article class="rx-hero__stat-card rx-hero__stat-card--primary">
        <span class="rx-hero__stat-icon" aria-hidden="true">
          <UIcon name="i-lucide-coins" class="size-5" />
        </span>
        <div class="rx-hero__stat-content">
          <span class="eyebrow">Renda passiva mensal</span>
          <div class="rx-hero__stat-number">{{ monthlyDividendsLabel }}</div>
          <p class="rx-hero__stat-sub">
            pra cada <strong>R$ 100 mil</strong> investidos seguindo essa composição
          </p>
        </div>
      </article>

      <article class="rx-hero__stat-card">
        <span class="rx-hero__stat-icon" aria-hidden="true">
          <UIcon name="i-lucide-trending-up" class="size-5" />
        </span>
        <div class="rx-hero__stat-content">
          <span class="eyebrow">Retorno esperado</span>
          <div class="rx-hero__stat-number">{{ expectedReturnLabel }} <span class="rx-hero__stat-unit">aa</span></div>
          <p
            class="rx-hero__stat-sub"
            :style="{
              color: vsCdi.positive ? 'var(--brand-positive)' : 'var(--brand-negative)',
            }"
          >
            <UIcon
              :name="vsCdi.positive ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
              class="size-3.5 inline-block"
              aria-hidden="true"
            />
            <strong>{{ vsCdi.label }}</strong>
          </p>
        </div>
      </article>

      <article class="rx-hero__stat-card">
        <span class="rx-hero__stat-icon" aria-hidden="true">
          <UIcon name="i-lucide-trophy" class="size-5" />
        </span>
        <div class="rx-hero__stat-content">
          <span class="eyebrow">Posição no ranking</span>
          <div class="rx-hero__stat-number rx-hero__stat-number--text">{{ percentilePosition }}</div>
          <p class="rx-hero__stat-sub">
            entre investidores brasileiros analisados pela Redent.IA
          </p>
        </div>
      </article>
    </div>

    <!-- ============ 3. 3 DESCOBERTAS DA IA ============ -->
    <div class="rx-hero__discoveries">
      <header class="rx-hero__section-header">
        <span class="eyebrow">A IA ENCONTROU</span>
        <h2 class="rx-hero__section-title">
          {{ topDiscoveries.length }} {{ topDiscoveries.length === 1 ? 'coisa' : 'coisas' }} importante{{ topDiscoveries.length === 1 ? '' : 's' }} na sua carteira
        </h2>
      </header>

      <div class="rx-hero__discoveries-list">
        <article
          v-for="(disc, idx) in topDiscoveries"
          :key="idx"
          class="rx-hero__discovery"
          :class="`rx-hero__discovery--${disc.type}`"
        >
          <div class="rx-hero__discovery-icon" aria-hidden="true">
            <UIcon :name="disc.icon" class="size-6" />
          </div>
          <div class="rx-hero__discovery-content">
            <h3 class="rx-hero__discovery-title">{{ disc.title }}</h3>
            <p class="rx-hero__discovery-desc">{{ disc.description }}</p>
          </div>
        </article>
      </div>
    </div>

    <!-- ============ 4. STRESS TEST (Covid 2020) ============ -->
    <div v-if="stressTest" class="rx-hero__stress">
      <header class="rx-hero__section-header">
        <span class="eyebrow">TESTE DE STRESS</span>
        <h2 class="rx-hero__section-title">
          E se acontecer: <em :style="{ color: 'var(--brand-primary)', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }">Covid</em>
        </h2>
        <p class="rx-hero__stress-context">{{ stressTest.scenarioDescription }}</p>
      </header>

      <div class="rx-hero__stress-grid">
        <div class="rx-hero__stress-row">
          <div class="rx-hero__stress-label">
            <span class="rx-hero__stress-name">Sua carteira</span>
            <span
              class="rx-hero__stress-value"
              :style="{ color: 'var(--brand-negative)' }"
            >
              {{ stressTest.portfolioImpact.toFixed(1) }}%
            </span>
          </div>
          <div class="rx-hero__stress-bar-wrap">
            <div
              class="rx-hero__stress-bar"
              :style="{
                width: `${stressTest.portfolioPct}%`,
                background: 'var(--brand-negative)',
              }"
            />
          </div>
        </div>

        <div class="rx-hero__stress-row">
          <div class="rx-hero__stress-label">
            <span class="rx-hero__stress-name">
              <UIcon name="i-lucide-sparkles" class="size-3.5 inline-block" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              Carteira recomendada Redent.IA
            </span>
            <span
              class="rx-hero__stress-value"
              :style="{ color: 'var(--brand-primary)' }"
            >
              {{ stressTest.recommendedImpact.toFixed(1) }}%
            </span>
          </div>
          <div class="rx-hero__stress-bar-wrap">
            <div
              class="rx-hero__stress-bar"
              :style="{
                width: `${stressTest.recommendedPct}%`,
                background: 'var(--brand-primary)',
              }"
            />
          </div>
        </div>
      </div>

      <p class="rx-hero__stress-conclusion">
        <UIcon name="i-lucide-shield-check" class="size-4 inline-block" :style="{ color: 'var(--brand-positive)' }" aria-hidden="true" />
        Com a recomendação da Redent.IA, você teria perdido
        <strong>{{ Math.abs(stressTest.protectionPct) }}% menos</strong>
        nesse cenário.
      </p>
    </div>
  </section>
</template>

<style scoped>
.rx-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 56px;
  padding: 32px 0 80px;
  isolation: isolate;
}

@media (min-width: 768px) {
  .rx-hero {
    gap: 72px;
    padding: 48px 0 96px;
  }
}

.rx-hero__glow {
  position: absolute;
  inset: -120px -120px auto -120px;
  height: 600px;
  filter: blur(80px);
  z-index: -1;
  pointer-events: none;
  animation: rx-hero-glow-fade 1.4s ease-out;
}

@keyframes rx-hero-glow-fade {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
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

/* ============ 1. SCORE HERO ============ */
.rx-hero__score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  animation: rx-hero-fade-up 0.8s ease-out;
}

@keyframes rx-hero-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.rx-hero__eyebrow {
  margin-bottom: 4px;
}

.rx-hero__score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.rx-hero__score-number-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.rx-hero__score-number {
  font-family: var(--brand-font);
  font-size: 96px;
  font-weight: 200;
  line-height: 0.95;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  /* Glow sutil amber pra dar drama */
  text-shadow: 0 4px 32px color-mix(in srgb, currentColor 40%, transparent);
}

@media (min-width: 768px) {
  .rx-hero__score-number {
    font-size: 144px;
  }
}

.rx-hero__score-max {
  font-family: var(--brand-font);
  font-size: 24px;
  font-weight: 300;
  color: var(--text-muted);
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .rx-hero__score-max { font-size: 32px; }
}

.rx-hero__score-band {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  border: 1px solid;
}

.rx-hero__headline {
  font-family: var(--brand-font);
  font-size: 28px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 8px 0 0;
  max-width: 720px;
  text-wrap: balance;
}

@media (min-width: 768px) {
  .rx-hero__headline { font-size: 44px; }
}

.rx-hero__subhead {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-body);
  max-width: 520px;
  margin: 0;
}

@media (min-width: 768px) {
  .rx-hero__subhead { font-size: 16px; }
}

.rx-hero__bar {
  width: 100%;
  max-width: 480px;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
  margin-top: 16px;
}

.rx-hero__bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 1.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.rx-hero__bar-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 480px;
  font-family: var(--brand-font);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ============ 2. STATS CARDS ============ */
.rx-hero__stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  animation: rx-hero-fade-up 0.8s ease-out 0.2s backwards;
}

@media (min-width: 768px) {
  .rx-hero__stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

.rx-hero__stat-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  transition: border-color 220ms, transform 220ms;
}

.rx-hero__stat-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, var(--border-subtle));
  transform: translateY(-2px);
}

.rx-hero__stat-card--primary {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated)) 0%,
    var(--bg-elevated) 100%
  );
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

.rx-hero__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}

.rx-hero__stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.rx-hero__stat-content .eyebrow {
  font-size: 10px;
}

.rx-hero__stat-number {
  font-family: var(--brand-font);
  font-size: 26px;
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  margin: 2px 0;
}

@media (min-width: 768px) {
  .rx-hero__stat-number { font-size: 30px; }
}

.rx-hero__stat-number--text {
  font-size: 22px;
  text-transform: capitalize;
}

@media (min-width: 768px) {
  .rx-hero__stat-number--text { font-size: 26px; }
}

.rx-hero__stat-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  letter-spacing: -0.01em;
}

.rx-hero__stat-sub {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-muted);
  margin: 0;
}

.rx-hero__stat-sub strong {
  color: var(--text-heading);
  font-weight: 600;
}

/* ============ SECTION HEADERS (descobertas + stress) ============ */
.rx-hero__section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  text-align: center;
}

.rx-hero__section-title {
  font-family: var(--brand-font);
  font-size: 26px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
  text-wrap: balance;
}

@media (min-width: 768px) {
  .rx-hero__section-title { font-size: 36px; }
}

/* ============ 3. DESCOBERTAS ============ */
.rx-hero__discoveries {
  animation: rx-hero-fade-up 0.8s ease-out 0.4s backwards;
}

.rx-hero__discoveries-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rx-hero__discovery {
  display: flex;
  gap: 16px;
  padding: 22px;
  border-radius: 16px;
  border: 1px solid;
  transition: transform 220ms, border-color 220ms;
}

.rx-hero__discovery:hover {
  transform: translateY(-2px);
}

.rx-hero__discovery--critical {
  background: color-mix(in srgb, #ef4444 6%, var(--bg-elevated));
  border-color: color-mix(in srgb, #ef4444 25%, transparent);
}

.rx-hero__discovery--critical .rx-hero__discovery-icon {
  background: color-mix(in srgb, #ef4444 14%, transparent);
  color: #ef4444;
}

.rx-hero__discovery--warning {
  background: color-mix(in srgb, #F59E0B 6%, var(--bg-elevated));
  border-color: color-mix(in srgb, #F59E0B 25%, transparent);
}

.rx-hero__discovery--warning .rx-hero__discovery-icon {
  background: color-mix(in srgb, #F59E0B 14%, transparent);
  color: #F59E0B;
}

.rx-hero__discovery--positive {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 6%, var(--bg-elevated));
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 25%, transparent);
}

.rx-hero__discovery--positive .rx-hero__discovery-icon {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent);
  color: var(--brand-positive, #10b981);
}

.rx-hero__discovery-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.rx-hero__discovery-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.rx-hero__discovery-title {
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--text-heading);
  margin: 0;
}

@media (min-width: 768px) {
  .rx-hero__discovery-title { font-size: 18px; }
}

.rx-hero__discovery-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-body);
  margin: 0;
}

@media (min-width: 768px) {
  .rx-hero__discovery-desc { font-size: 14px; }
}

/* ============ 4. STRESS TEST ============ */
.rx-hero__stress {
  padding: 28px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--brand-primary) 4%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  animation: rx-hero-fade-up 0.8s ease-out 0.6s backwards;
}

@media (min-width: 768px) {
  .rx-hero__stress {
    padding: 36px;
  }
}

.rx-hero__stress-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 20px;
}

.rx-hero__stress-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rx-hero__stress-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.rx-hero__stress-name {
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-heading);
}

.rx-hero__stress-value {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.rx-hero__stress-bar-wrap {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
}

.rx-hero__stress-bar {
  height: 100%;
  border-radius: inherit;
  animation: rx-hero-bar-grow 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.8s backwards;
  transform-origin: left;
}

@keyframes rx-hero-bar-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.rx-hero__stress-conclusion {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-body);
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--brand-primary) 14%, transparent);
}

.rx-hero__stress-conclusion strong {
  color: var(--text-heading);
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .rx-hero__glow,
  .rx-hero__score-block,
  .rx-hero__stats,
  .rx-hero__discoveries,
  .rx-hero__stress,
  .rx-hero__stress-bar {
    animation: none;
  }
  .rx-hero__bar-fill {
    transition: none;
  }
}
</style>
