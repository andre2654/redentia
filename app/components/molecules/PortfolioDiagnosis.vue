<!--
  PortfolioDiagnosis (versao EXTENSA)

  12+ secoes que aproveitam TUDO que existe nos dados (fundamentos completos,
  dividendos, projecoes, stress test, alocacao por classe, alternativas, eventos
  e insights da IA).

  Secoes na ordem:
   1. Score header + chips de ativos + CTAs
   2. Allocation by class (donut)
   3. Insights da IA (paragrafos textuais)
   4. Dimensoes (9 barras com explicacao)
   5. Concentracao Setorial (top 5)
   6. Por-ativo deep dive (cada ativo com fundamentais + status da tese)
   7. Pontos Fortes (cards verde)
   8. Riscos (cards severity-coded)
   9. Teses sob risco (cards com mantida/em-atencao/enfraquecida/quebrada)
  10. Comparacao com benchmarks (CDI / IBOV / IFIX / S&P 500)
  11. Stress test (4 cenarios)
  12. Dividendos projetados (mensal por ativo + total)
  13. Sensibilidade macro (Selic, Cambio, IPCA, Commodities)
  14. Alternativas comparaveis (sugestoes DE → PARA)
  15. Eventos recentes
  16. Perguntas sugeridas (links pro /help)
  17. CTA monitoramento + assessor humano
-->
<script setup lang="ts">
import type { PortfolioReport, PortfolioRisk } from '~/composables/usePortfolioScore'

interface Props {
  report: PortfolioReport
  showShare?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showShare: true,
})

const brand = useBrand()
const fmt = useFormat()

function severityColor(s: PortfolioRisk['severity']): string {
  if (s === 'high') return brand.colors.negative || '#FF4747'
  if (s === 'medium') return brand.colors.primary || '#F5A623'
  return brand.colors.positive || '#00D395'
}

function severityLabel(s: PortfolioRisk['severity']): string {
  return s === 'high' ? 'Alto' : s === 'medium' ? 'Medio' : 'Baixo'
}

const dimensionTone = (tone: string): string => {
  if (tone === 'good') return brand.colors.positive || '#00D395'
  if (tone === 'mid') return brand.colors.primary || '#F5A623'
  return brand.colors.negative || '#FF4747'
}

function impactColor(impact: 'positive' | 'negative' | 'neutral'): string {
  if (impact === 'positive') return brand.colors.positive || '#00D395'
  if (impact === 'negative') return brand.colors.negative || '#FF4747'
  return brand.colors.primary || '#F5A623'
}

function impactIcon(impact: 'positive' | 'negative' | 'neutral'): string {
  if (impact === 'positive') return 'i-lucide-trending-up'
  if (impact === 'negative') return 'i-lucide-trending-down'
  return 'i-lucide-minus'
}

function thesisStatusColor(status: string): string {
  if (status === 'mantida') return brand.colors.positive || '#00D395'
  if (status === 'em-atencao') return brand.colors.primary || '#F5A623'
  if (status === 'enfraquecida') return '#fb923c'
  return brand.colors.negative || '#FF4747'
}

function thesisStatusLabel(status: string): string {
  return status === 'mantida' ? 'Tese mantida'
    : status === 'em-atencao' ? 'Em atencao'
    : status === 'enfraquecida' ? 'Enfraquecida'
    : 'Quebrada'
}

function categoryLabel(cat: string): string {
  const m: Record<string, string> = {
    'renda-fixa-pos': 'Renda Fixa Pos',
    'renda-fixa-pre': 'Renda Fixa Pre',
    'renda-fixa-ipca': 'Renda Fixa IPCA',
    'acoes-br': 'Acao',
    'fii-tijolo': 'FII Tijolo',
    'fii-papel': 'FII Papel',
    'etf-br': 'ETF Brasil',
    'etf-intl': 'ETF Internacional',
    'bdr': 'BDR',
    'cripto': 'Cripto',
  }
  return m[cat] || cat
}

const sectorTopFive = computed(() => props.report.sectorConcentration.slice(0, 5))

function shareText(): string {
  return `Minha carteira recebeu Redent Score ${props.report.score}/100 (${props.report.bandLabel}).`
}

async function onShare() {
  const text = shareText()
  const url = `${window.location.origin}/raio-x?tickers=${props.report.composition.map(a => a.ticker).join(',')}`
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({ title: 'Meu Redent Score', text, url })
      return
    }
    catch { /* ignored */ }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${text} ${url}`)
    alert('Copiado para a area de transferencia.')
  }
}

// Donut alocacao por classe
const donutSize = 240
const donutStroke = 38
const donutRadius = (donutSize - donutStroke) / 2
const donutCircumference = 2 * Math.PI * donutRadius

const donutSegments = computed(() => {
  let cumulative = 0
  return props.report.allocationByClass.map((seg) => {
    const length = donutCircumference * seg.weight
    const offset = donutCircumference * cumulative
    cumulative += seg.weight
    return { ...seg, length, offset }
  })
})

function formatPercent(n: number | undefined | null, digits = 1): string {
  if (n === undefined || n === null || Number.isNaN(n)) return '—'
  return `${n.toFixed(digits)}%`
}
</script>

<template>
  <div class="diagnosis flex flex-col gap-14 md:gap-20">
    <!-- ================ 1. Top: Score + composicao + headline ================ -->
    <section class="diagnosis__top grid gap-10 md:grid-cols-12 md:gap-12 md:items-center">
      <div class="diagnosis__score-col md:col-span-5 flex flex-col items-center md:items-start">
        <MoleculesPortfolioScoreDial :report="report" size="md" :show-band="false" />
      </div>

      <div class="md:col-span-7 flex flex-col gap-5">
        <p class="eyebrow">RAIO-X DA CARTEIRA</p>
        <h2
          class="text-[32px] font-light leading-[1.05] tracking-[-0.025em] md:text-[44px]"
          :style="{ color: 'var(--text-heading)' }"
        >
          {{ report.composition.length }} ativos analisados.
          <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">{{ report.bandLabel.toLowerCase() }}.</span>
        </h2>
        <p class="text-[16px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
          Identificamos <strong :style="{ color: 'var(--text-heading)' }">{{ report.strengths.length }} pontos fortes</strong> e <strong :style="{ color: 'var(--text-heading)' }">{{ report.risks.length }} riscos</strong>, com retorno esperado de <strong class="tabular-nums" :style="{ color: 'var(--brand-primary)' }">{{ formatPercent(report.expectedReturn) }} ao ano</strong> ({{ report.expectedReturnLabel.toLowerCase() }}).
        </p>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="asset in report.composition"
            :key="asset.ticker"
            class="diagnosis__asset-chip"
          >
            <span class="diagnosis__asset-ticker">{{ asset.ticker }}</span>
            <span class="diagnosis__asset-weight tabular-nums">{{ (asset.weight * 100).toFixed(0) }}%</span>
          </li>
        </ul>

        <div v-if="showShare" class="flex flex-wrap gap-3 pt-2">
          <NuxtLink to="/auth/register" class="quiet-btn-primary">
            <UIcon name="i-lucide-bell" class="size-4" aria-hidden="true" />
            Monitorar minha carteira gratis
          </NuxtLink>
          <button type="button" class="quiet-btn-ghost" @click="onShare">
            <UIcon name="i-lucide-share-2" class="size-4" aria-hidden="true" />
            Compartilhar
          </button>
        </div>
      </div>
    </section>

    <!-- ================ 2. Allocation Donut + Resumo numerico ================ -->
    <section class="grid gap-8 md:grid-cols-2 md:gap-10 md:items-stretch">
      <article class="quiet-card flex flex-col gap-5 p-6">
        <header>
          <p class="eyebrow mb-1">ALOCACAO POR CLASSE</p>
          <h3 class="text-[20px] font-medium" :style="{ color: 'var(--text-heading)' }">
            Como sua carteira esta dividida
          </h3>
        </header>
        <div class="diagnosis__donut-wrap">
          <svg :width="donutSize" :height="donutSize" :viewBox="`0 0 ${donutSize} ${donutSize}`">
            <g :transform="`rotate(-90 ${donutSize / 2} ${donutSize / 2})`">
              <circle
                v-for="seg in donutSegments"
                :key="seg.classId"
                :cx="donutSize / 2"
                :cy="donutSize / 2"
                :r="donutRadius"
                fill="none"
                :stroke="seg.color"
                :stroke-width="donutStroke"
                :stroke-dasharray="`${seg.length} ${donutCircumference}`"
                :stroke-dashoffset="-seg.offset"
                stroke-linecap="butt"
              />
            </g>
          </svg>
          <div class="diagnosis__donut-center">
            <span class="text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">CLASSES</span>
            <span class="text-[36px] font-light tabular-nums leading-none" :style="{ color: 'var(--text-heading)' }">{{ report.allocationByClass.length }}</span>
          </div>
        </div>
        <ul class="diagnosis__donut-legend">
          <li v-for="seg in report.allocationByClass" :key="seg.classId">
            <span class="diagnosis__donut-dot" :style="{ background: seg.color }" />
            <span class="diagnosis__donut-label">{{ seg.label }}</span>
            <span class="diagnosis__donut-weight tabular-nums">{{ formatPercent(seg.weight * 100, 0) }}</span>
          </li>
        </ul>
      </article>

      <article class="quiet-card flex flex-col gap-5 p-6">
        <header>
          <p class="eyebrow mb-1">RESUMO EM NUMEROS</p>
          <h3 class="text-[20px] font-medium" :style="{ color: 'var(--text-heading)' }">
            O que essa carteira entrega
          </h3>
        </header>
        <ul class="diagnosis__metric-grid">
          <li>
            <span class="diagnosis__metric-label">Retorno esperado</span>
            <span class="diagnosis__metric-value tabular-nums" :style="{ color: 'var(--text-heading)' }">{{ formatPercent(report.expectedReturn) }}</span>
            <span class="diagnosis__metric-hint" :style="{ color: report.expectedReturn >= 11 ? 'var(--brand-positive)' : 'var(--text-muted)' }">{{ report.expectedReturnLabel }}</span>
          </li>
          <li>
            <span class="diagnosis__metric-label">Dividendos para R$ 100k</span>
            <span class="diagnosis__metric-value tabular-nums" :style="{ color: 'var(--text-heading)' }">R$ {{ report.monthlyDividendsTotal.toLocaleString('pt-BR') }}</span>
            <span class="diagnosis__metric-hint" :style="{ color: 'var(--text-muted)' }">por mes em renda passiva</span>
          </li>
          <li>
            <span class="diagnosis__metric-label">Ativos analisados</span>
            <span class="diagnosis__metric-value tabular-nums" :style="{ color: 'var(--text-heading)' }">{{ report.composition.length }}</span>
            <span class="diagnosis__metric-hint" :style="{ color: 'var(--text-muted)' }">em {{ report.sectorConcentration.length }} setores</span>
          </li>
          <li>
            <span class="diagnosis__metric-label">Beta ponderado</span>
            <span class="diagnosis__metric-value tabular-nums" :style="{ color: 'var(--text-heading)' }">
              {{ (report.composition.reduce((s, a) => s + a.beta * a.weight, 0)).toFixed(2) }}
            </span>
            <span class="diagnosis__metric-hint" :style="{ color: 'var(--text-muted)' }">vs mercado = 1.00</span>
          </li>
          <li>
            <span class="diagnosis__metric-label">DY ponderado</span>
            <span class="diagnosis__metric-value tabular-nums" :style="{ color: 'var(--text-heading)' }">
              {{ formatPercent(report.composition.reduce((s, a) => s + a.dy * a.weight, 0)) }}
            </span>
            <span class="diagnosis__metric-hint" :style="{ color: 'var(--text-muted)' }">aa em dividendos</span>
          </li>
          <li>
            <span class="diagnosis__metric-label">Exposicao internacional</span>
            <span class="diagnosis__metric-value tabular-nums" :style="{ color: 'var(--text-heading)' }">
              {{ formatPercent(report.composition.filter(a => a.internacional).reduce((s, a) => s + a.weight, 0) * 100, 0) }}
            </span>
            <span class="diagnosis__metric-hint" :style="{ color: 'var(--text-muted)' }">em ativos dolarizados</span>
          </li>
        </ul>
      </article>
    </section>

    <!-- ================ 3. AI Insights ================ -->
    <section v-if="report.aiInsights.length > 0" class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">ANALISE DA IA</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          O que a Redent.IA esta vendo na sua
          <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">carteira</span>.
        </h3>
      </header>
      <ul class="grid gap-4 md:grid-cols-2">
        <li v-for="(insight, i) in report.aiInsights" :key="i" class="diagnosis__insight">
          <span class="diagnosis__insight-icon">
            <UIcon :name="insight.icon" class="size-4" aria-hidden="true" />
          </span>
          <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
            {{ insight.paragraph }}
          </p>
        </li>
      </ul>
    </section>

    <!-- ================ 4. Dimensoes + Concentracao Setorial ================ -->
    <section class="grid gap-8 md:grid-cols-2 md:gap-10">
      <article class="quiet-card p-6">
        <header class="mb-5">
          <p class="eyebrow mb-1">DIMENSOES</p>
          <h3 class="text-[20px] font-medium" :style="{ color: 'var(--text-heading)' }">
            Como cada criterio pontua
          </h3>
        </header>
        <ul class="flex flex-col gap-4">
          <li v-for="dim in report.dimensions" :key="dim.id" class="diagnosis__dim">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ dim.label }}</span>
              <span class="diagnosis__dim-meta">
                <span class="diagnosis__dim-level" :style="{ color: dimensionTone(dim.tone) }">{{ dim.level }}</span>
                <span class="tabular-nums" :style="{ color: 'var(--text-muted)' }">{{ dim.score }}/100</span>
              </span>
            </div>
            <div class="diagnosis__dim-bar" aria-hidden="true">
              <span class="diagnosis__dim-fill" :style="{ width: `${dim.score}%`, background: dimensionTone(dim.tone) }" />
            </div>
            <p class="text-[12px] leading-relaxed" :style="{ color: 'var(--text-muted)' }">{{ dim.explanation }}</p>
          </li>
        </ul>
      </article>

      <article class="quiet-card p-6">
        <header class="mb-5">
          <p class="eyebrow mb-1">CONCENTRACAO SETORIAL</p>
          <h3 class="text-[20px] font-medium" :style="{ color: 'var(--text-heading)' }">
            Onde sua carteira esta exposta
          </h3>
        </header>
        <ul class="flex flex-col gap-4">
          <li v-for="(sector, idx) in report.sectorConcentration" :key="sector.sector" class="diagnosis__sector">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ sector.sector }}</span>
              <span class="tabular-nums text-[14px] font-medium" :style="{ color: idx === 0 && sector.weight > 0.30 ? 'var(--brand-negative)' : 'var(--text-body)' }">{{ formatPercent(sector.weight * 100) }}</span>
            </div>
            <div class="diagnosis__sector-bar" aria-hidden="true">
              <span
                class="diagnosis__sector-fill"
                :style="{
                  width: `${Math.min(sector.weight * 100, 100)}%`,
                  background: idx === 0 && sector.weight > 0.30
                    ? `color-mix(in srgb, ${brand.colors.negative} 90%, transparent)`
                    : idx === 0
                      ? brand.colors.primary
                      : `color-mix(in srgb, ${brand.colors.primary} ${Math.max(40, 90 - idx * 14)}%, var(--bg-overlay))`
                }"
              />
            </div>
          </li>
        </ul>
      </article>
    </section>

    <!-- ================ 5. Por-ativo Deep Dive ================ -->
    <section class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">ANALISE POR ATIVO</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          Cada ativo, sob a lupa.
        </h3>
      </header>
      <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="asset in report.composition" :key="asset.ticker" class="diagnosis__asset-card">
          <header class="flex items-center justify-between gap-3 border-b pb-3" style="border-color: var(--border-subtle)">
            <div class="flex items-baseline gap-2">
              <span class="text-[16px] font-medium tabular-nums" :style="{ color: 'var(--text-heading)' }">{{ asset.ticker }}</span>
              <span class="text-[11px] uppercase tracking-[0.06em]" :style="{ color: 'var(--text-muted)' }">{{ categoryLabel(asset.category) }}</span>
            </div>
            <span
              class="diagnosis__asset-thesis"
              :style="{
                color: thesisStatusColor(asset.thesisStatus),
                background: `color-mix(in srgb, ${thesisStatusColor(asset.thesisStatus)} 14%, transparent)`,
                borderColor: `color-mix(in srgb, ${thesisStatusColor(asset.thesisStatus)} 30%, transparent)`,
              }"
            >{{ thesisStatusLabel(asset.thesisStatus) }}</span>
          </header>
          <p class="diagnosis__asset-name">{{ asset.name }}</p>
          <ul class="diagnosis__asset-metrics">
            <li v-if="asset.fundamentals.pl !== undefined">
              <span>P/L</span>
              <strong class="tabular-nums">{{ asset.fundamentals.pl.toFixed(1) }}</strong>
            </li>
            <li v-if="asset.fundamentals.pvp !== undefined">
              <span>P/VP</span>
              <strong class="tabular-nums">{{ asset.fundamentals.pvp.toFixed(2) }}</strong>
            </li>
            <li v-if="asset.fundamentals.roe !== undefined">
              <span>ROE</span>
              <strong class="tabular-nums" :style="{ color: asset.fundamentals.roe < 0 ? 'var(--brand-negative)' : asset.fundamentals.roe > 15 ? 'var(--brand-positive)' : 'var(--text-heading)' }">{{ formatPercent(asset.fundamentals.roe) }}</strong>
            </li>
            <li v-if="asset.dy > 0">
              <span>DY</span>
              <strong class="tabular-nums" :style="{ color: asset.dy > 8 ? 'var(--brand-positive)' : 'var(--text-heading)' }">{{ formatPercent(asset.dy) }}</strong>
            </li>
            <li v-if="asset.fundamentals.netDebtEbitda !== undefined">
              <span>Div/EBITDA</span>
              <strong class="tabular-nums" :style="{ color: asset.fundamentals.netDebtEbitda > 3 ? 'var(--brand-negative)' : asset.fundamentals.netDebtEbitda < 1 ? 'var(--brand-positive)' : 'var(--text-heading)' }">{{ asset.fundamentals.netDebtEbitda.toFixed(1) }}</strong>
            </li>
            <li v-if="asset.fundamentals.payout !== undefined">
              <span>Payout</span>
              <strong class="tabular-nums">{{ formatPercent(asset.fundamentals.payout, 0) }}</strong>
            </li>
            <li v-if="asset.fundamentals.vacancia !== undefined">
              <span>Vacancia</span>
              <strong class="tabular-nums" :style="{ color: asset.fundamentals.vacancia > 8 ? 'var(--brand-negative)' : 'var(--text-heading)' }">{{ formatPercent(asset.fundamentals.vacancia) }}</strong>
            </li>
            <li v-if="asset.fundamentals.pVpa !== undefined">
              <span>P/VPA</span>
              <strong class="tabular-nums">{{ asset.fundamentals.pVpa.toFixed(2) }}</strong>
            </li>
            <li v-if="asset.fundamentals.earningsCagr5y !== undefined">
              <span>CAGR Lucro 5Y</span>
              <strong class="tabular-nums" :style="{ color: asset.fundamentals.earningsCagr5y < 0 ? 'var(--brand-negative)' : asset.fundamentals.earningsCagr5y > 15 ? 'var(--brand-positive)' : 'var(--text-heading)' }">{{ asset.fundamentals.earningsCagr5y > 0 ? '+' : '' }}{{ formatPercent(asset.fundamentals.earningsCagr5y) }}</strong>
            </li>
            <li>
              <span>Beta</span>
              <strong class="tabular-nums">{{ asset.beta.toFixed(2) }}</strong>
            </li>
            <li>
              <span>Peso</span>
              <strong class="tabular-nums" :style="{ color: 'var(--brand-primary)' }">{{ formatPercent(asset.weight * 100, 0) }}</strong>
            </li>
          </ul>
          <p class="diagnosis__asset-note" :style="{ color: 'var(--text-muted)' }">{{ asset.thesisNote }}</p>
        </li>
      </ul>
    </section>

    <!-- ================ 6. Pontos fortes ================ -->
    <section v-if="report.strengths.length > 0" class="flex flex-col gap-6">
      <header class="flex items-baseline justify-between gap-4">
        <div>
          <p class="eyebrow mb-1">PONTOS FORTES</p>
          <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
            O que sua carteira faz bem.
          </h3>
        </div>
        <span class="hidden text-[12px] tabular-nums sm:inline" :style="{ color: 'var(--text-muted)' }">{{ report.strengths.length }} encontrado{{ report.strengths.length > 1 ? 's' : '' }}</span>
      </header>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="(s, i) in report.strengths" :key="i" class="diagnosis__strength quiet-card">
          <span class="diagnosis__strength-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.positive} 16%, transparent)`, color: brand.colors.positive }">
            <UIcon :name="s.icon" class="size-5" aria-hidden="true" />
          </span>
          <div class="flex flex-col gap-1">
            <h4 class="text-[15px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ s.title }}</h4>
            <p class="text-[13px] leading-relaxed" :style="{ color: 'var(--text-body)' }">{{ s.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- ================ 7. Riscos ================ -->
    <section v-if="report.risks.length > 0" class="flex flex-col gap-6">
      <header class="flex items-baseline justify-between gap-4">
        <div>
          <p class="eyebrow mb-1">RISCOS ENCONTRADOS</p>
          <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
            O que merece sua atencao agora.
          </h3>
        </div>
        <span class="hidden text-[12px] tabular-nums sm:inline" :style="{ color: 'var(--text-muted)' }">{{ report.risks.length }} identificado{{ report.risks.length > 1 ? 's' : '' }}</span>
      </header>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="(risk, i) in report.risks" :key="i" class="diagnosis__risk quiet-card" :data-severity="risk.severity">
          <header class="mb-3 flex items-center justify-between gap-3">
            <span class="diagnosis__risk-icon" :style="{ background: `color-mix(in srgb, ${severityColor(risk.severity)} 16%, transparent)`, color: severityColor(risk.severity) }">
              <UIcon :name="risk.icon" class="size-5" aria-hidden="true" />
            </span>
            <span class="diagnosis__risk-pill" :style="{ backgroundColor: `color-mix(in srgb, ${severityColor(risk.severity)} 12%, transparent)`, color: severityColor(risk.severity), borderColor: `color-mix(in srgb, ${severityColor(risk.severity)} 30%, transparent)` }">Risco {{ severityLabel(risk.severity).toLowerCase() }}</span>
          </header>
          <h4 class="mb-1 text-[16px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ risk.title }}</h4>
          <p class="text-[13px] leading-relaxed" :style="{ color: 'var(--text-body)' }">{{ risk.description }}</p>
        </article>
      </div>
    </section>

    <!-- ================ 8. Teses sob risco ================ -->
    <section v-if="report.thesesAtRisk.length > 0" class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">TESES SOB RISCO</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          Os ativos onde a tese original nao se sustenta mais.
        </h3>
      </header>
      <ul class="flex flex-col gap-3">
        <li v-for="t in report.thesesAtRisk" :key="t.ticker" class="diagnosis__thesis">
          <span class="diagnosis__thesis-status" :style="{ color: thesisStatusColor(t.status), background: `color-mix(in srgb, ${thesisStatusColor(t.status)} 14%, transparent)` }">
            {{ thesisStatusLabel(t.status) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-[15px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ t.ticker }}</p>
            <p class="text-[13px] leading-relaxed" :style="{ color: 'var(--text-body)' }">{{ t.reason }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- ================ 9. Comparacao com benchmarks ================ -->
    <section class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">VS BENCHMARKS</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          Como sua carteira se compara.
        </h3>
      </header>
      <ul class="diagnosis__benchmarks">
        <li v-for="b in report.benchmarks" :key="b.label" class="diagnosis__benchmark">
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ b.label }}</span>
            <span class="tabular-nums text-[14px]" :style="{ color: 'var(--text-body)' }">{{ formatPercent(b.expected) }} aa</span>
          </div>
          <div class="diagnosis__benchmark-bar">
            <span class="diagnosis__benchmark-bench" :style="{ width: `${(b.expected / 16) * 100}%` }" />
            <span class="diagnosis__benchmark-yours" :style="{ width: `${(report.expectedReturn / 16) * 100}%`, background: brand.colors.primary }" />
          </div>
          <span class="text-[12px]" :style="{ color: b.vs === 'above' ? 'var(--brand-positive)' : b.vs === 'below' ? 'var(--brand-negative)' : 'var(--text-muted)' }">
            <UIcon
              :name="b.vs === 'above' ? 'i-lucide-trending-up' : b.vs === 'below' ? 'i-lucide-trending-down' : 'i-lucide-minus'"
              class="inline size-3.5" aria-hidden="true"
            />
            Sua carteira {{ b.vs === 'above' ? 'supera' : b.vs === 'below' ? 'fica abaixo' : 'esta em linha com' }} {{ b.label }} ({{ formatPercent(report.expectedReturn) }} aa)
          </span>
        </li>
      </ul>
    </section>

    <!-- ================ 10. Stress Test ================ -->
    <section class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">STRESS TEST</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          O que aconteceria em cenarios adversos.
        </h3>
        <p class="mt-2 max-w-2xl text-[14px]" :style="{ color: 'var(--text-muted)' }">
          Simulacoes hipoteticas baseadas no peso da sua carteira em cada classe. Variaveis reais podem diferir.
        </p>
      </header>
      <div class="grid gap-4 md:grid-cols-2">
        <article v-for="s in report.stressScenarios" :key="s.id" class="diagnosis__stress quiet-card">
          <header class="mb-3 flex items-start justify-between gap-3">
            <span class="diagnosis__stress-icon" :style="{ background: `color-mix(in srgb, ${s.impact >= 0 ? brand.colors.positive : brand.colors.negative} 14%, transparent)`, color: s.impact >= 0 ? brand.colors.positive : brand.colors.negative }">
              <UIcon :name="s.icon" class="size-5" aria-hidden="true" />
            </span>
            <span
              class="diagnosis__stress-pill"
              :style="{
                color: s.resilience === 'forte' ? brand.colors.positive : s.resilience === 'media' ? brand.colors.primary : brand.colors.negative,
                background: `color-mix(in srgb, ${s.resilience === 'forte' ? brand.colors.positive : s.resilience === 'media' ? brand.colors.primary : brand.colors.negative} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${s.resilience === 'forte' ? brand.colors.positive : s.resilience === 'media' ? brand.colors.primary : brand.colors.negative} 30%, transparent)`,
              }"
            >Resiliencia {{ s.resilience }}</span>
          </header>
          <h4 class="mb-1 text-[16px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ s.title }}</h4>
          <p class="mb-3 text-[13px] leading-relaxed" :style="{ color: 'var(--text-body)' }">{{ s.description }}</p>
          <div class="diagnosis__stress-impact">
            <span class="text-[11px] uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">IMPACTO ESTIMADO</span>
            <span
              class="diagnosis__stress-value tabular-nums"
              :style="{ color: s.impact >= 0 ? brand.colors.positive : brand.colors.negative }"
            >{{ s.impact >= 0 ? '+' : '' }}{{ s.impact.toFixed(1) }}%</span>
          </div>
        </article>
      </div>
    </section>

    <!-- ================ 11. Dividendos projetados ================ -->
    <section v-if="report.dividendForecast.length > 0" class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">DIVIDENDOS PROJETADOS</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          Sua renda passiva mensal.
        </h3>
        <p class="mt-2 max-w-2xl text-[14px]" :style="{ color: 'var(--text-muted)' }">
          Estimativa baseada no DY historico de cada ativo aplicado a uma carteira de R$ 100.000 com a sua composicao.
        </p>
      </header>
      <div class="grid gap-6 md:grid-cols-12">
        <div class="md:col-span-5">
          <article class="quiet-card diagnosis__div-total">
            <p class="eyebrow mb-1">RENDA MENSAL ESTIMADA</p>
            <p class="text-[44px] font-light tabular-nums leading-none" :style="{ color: 'var(--text-heading)' }">
              R$ {{ report.monthlyDividendsTotal.toLocaleString('pt-BR') }}
            </p>
            <p class="mt-2 text-[13px]" :style="{ color: 'var(--text-muted)' }">
              por mes para cada R$ 100.000 investidos
            </p>
            <p class="mt-4 text-[13px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
              Anualizando, voce receberia <strong class="tabular-nums" :style="{ color: 'var(--brand-primary)' }">R$ {{ (report.monthlyDividendsTotal * 12).toLocaleString('pt-BR') }}</strong> em renda passiva, equivalente a <strong class="tabular-nums" :style="{ color: 'var(--brand-primary)' }">{{ formatPercent(report.monthlyDividendsTotal * 12 / 1000) }}</strong> ao ano sobre o capital.
            </p>
          </article>
        </div>
        <div class="md:col-span-7">
          <ul class="diagnosis__div-list">
            <li v-for="d in report.dividendForecast" :key="d.ticker">
              <span class="text-[14px] font-medium tabular-nums" :style="{ color: 'var(--text-heading)' }">{{ d.ticker }}</span>
              <span class="tabular-nums text-[12px]" :style="{ color: 'var(--text-muted)' }">DY {{ formatPercent(d.yieldOnCost) }}</span>
              <span class="tabular-nums text-[14px] font-medium" :style="{ color: 'var(--brand-primary)' }">R$ {{ d.monthlyAvg.toFixed(2) }}/mes</span>
              <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">proximo: {{ d.nextDate }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ================ 12. Sensibilidade Macro ================ -->
    <section class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">SENSIBILIDADE MACRO</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          A quais variaveis sua carteira reage.
        </h3>
      </header>
      <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <li v-for="m in report.macroExposure" :key="m.factor" class="quiet-card diagnosis__macro">
          <header class="mb-2 flex items-center justify-between gap-3">
            <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ m.factor }}</span>
            <span
              class="diagnosis__macro-pill"
              :style="{
                color: m.level === 'high' ? brand.colors.negative : m.level === 'medium' ? brand.colors.primary : brand.colors.positive,
                background: `color-mix(in srgb, ${m.level === 'high' ? brand.colors.negative : m.level === 'medium' ? brand.colors.primary : brand.colors.positive} 12%, transparent)`,
              }"
            >{{ m.level === 'high' ? 'Alta' : m.level === 'medium' ? 'Media' : 'Baixa' }}</span>
          </header>
          <p class="text-[12px] leading-relaxed" :style="{ color: 'var(--text-body)' }">{{ m.impact }}</p>
        </li>
      </ul>
    </section>

    <!-- ================ 13. Alternativas Comparaveis ================ -->
    <section v-if="report.alternatives.length > 0" class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">ATIVOS COMPARAVEIS</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          Pares com fundamentos melhores para analise.
        </h3>
        <p class="mt-2 max-w-2xl text-[14px]" :style="{ color: 'var(--text-muted)' }">
          Hipoteses para voce avaliar, nao recomendacao individual de investimento.
        </p>
      </header>
      <ul class="grid gap-4 md:grid-cols-2">
        <li v-for="alt in report.alternatives" :key="`${alt.fromTicker}-${alt.toTicker}`" class="diagnosis__alt quiet-card">
          <header class="diagnosis__alt-header">
            <span class="diagnosis__alt-ticker" :style="{ color: 'var(--text-muted)' }">{{ alt.fromTicker }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4" :style="{ color: 'var(--text-muted)' }" aria-hidden="true" />
            <span class="diagnosis__alt-ticker" :style="{ color: 'var(--brand-primary)' }">{{ alt.toTicker }}</span>
          </header>
          <p class="diagnosis__alt-reason">{{ alt.reason }}</p>
          <ul class="diagnosis__alt-table">
            <li v-for="(f, i) in alt.fundamentals" :key="i">
              <span class="diagnosis__alt-label">{{ f.label }}</span>
              <span class="tabular-nums text-[12px]" :style="{ color: 'var(--text-muted)' }">{{ f.current }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-3 opacity-50" aria-hidden="true" />
              <span class="tabular-nums text-[13px] font-medium" :style="{ color: f.better === 'alt' ? brand.colors.positive : brand.colors.negative }">{{ f.alternative }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </section>

    <!-- ================ 14. Eventos Recentes ================ -->
    <section v-if="report.events.length > 0" class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">EVENTOS RECENTES</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          O que aconteceu com seus ativos.
        </h3>
      </header>
      <ul class="flex flex-col gap-3">
        <li v-for="(ev, i) in report.events" :key="i" class="diagnosis__event">
          <span class="diagnosis__event-icon" :style="{ background: `color-mix(in srgb, ${impactColor(ev.impact)} 14%, transparent)`, color: impactColor(ev.impact) }">
            <UIcon :name="impactIcon(ev.impact)" class="size-4" aria-hidden="true" />
          </span>
          <div class="diagnosis__event-body">
            <p class="text-[14px] leading-snug" :style="{ color: 'var(--text-heading)' }">{{ ev.headline }}</p>
            <p class="diagnosis__event-meta">
              <span class="font-medium tabular-nums" :style="{ color: 'var(--text-body)' }">{{ ev.ticker }}</span>
              <span aria-hidden="true">·</span>
              <span :style="{ color: 'var(--text-muted)' }">{{ ev.source }}</span>
              <span aria-hidden="true">·</span>
              <span :style="{ color: 'var(--text-muted)' }">{{ ev.date }}</span>
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- ================ 15. Perguntas sugeridas ================ -->
    <section v-if="report.suggestedQuestions.length > 0" class="flex flex-col gap-6">
      <header>
        <p class="eyebrow mb-1">PERGUNTE A REDENT.IA</p>
        <h3 class="text-[24px] font-light leading-tight tracking-[-0.02em] md:text-[32px]" :style="{ color: 'var(--text-heading)' }">
          Continue a conversa sobre essa carteira.
        </h3>
      </header>
      <ul class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="(q, i) in report.suggestedQuestions" :key="i">
          <NuxtLink :to="q.href" class="diagnosis__question">
            <UIcon name="i-lucide-message-circle" class="size-4 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
            <span>{{ q.text }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- ================ 16. CTA Monitoramento ================ -->
    <section class="diagnosis__cta">
      <div class="diagnosis__cta-inner">
        <p class="eyebrow mb-3">MONITORAMENTO CONTINUO</p>
        <h3 class="mb-3 text-[28px] font-light leading-[1.1] tracking-[-0.025em] md:text-[36px]" :style="{ color: 'var(--text-heading)' }">
          Receba alertas quando algo importante mudar na sua
          <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">carteira.</span>
        </h3>
        <p class="mb-6 max-w-2xl text-[15px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
          Esta foi uma analise pontual. Crie uma conta gratis e a Redent.IA passa a monitorar diariamente, avisando voce quando aparecer um risco novo, oportunidade ou mudanca de fundamentos.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/auth/register" class="quiet-btn-primary">
            <UIcon name="i-lucide-bell-ring" class="size-4" aria-hidden="true" />
            Monitorar minha carteira gratis
          </NuxtLink>
          <NuxtLink to="/help" class="quiet-btn-ghost">
            <UIcon name="i-lucide-message-circle" class="size-4" aria-hidden="true" />
            Conversar com a IA
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ================ 17. CTA Assessor Inteligente ================ -->
    <section class="diagnosis__advisor-cta">
      <div class="grid gap-8 md:grid-cols-12 md:items-center">
        <div class="md:col-span-7">
          <p class="eyebrow mb-3">AVALIACAO CONTINUA</p>
          <h3 class="mb-4 text-[26px] font-light leading-[1.1] tracking-[-0.025em] md:text-[36px]" :style="{ color: 'var(--text-heading)' }">
            Quer ir mais fundo, com nosso
            <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">assessor</span>
            inteligente?
          </h3>
          <p class="mb-5 text-[15px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
            Esta analise e o ponto de partida. O Assessor Inteligente da Redent.IA cruza fundamentos, noticias, dividendos e seu perfil de risco em tempo real, com a IA mais avancada da plataforma. Ele acompanha sua carteira diariamente e te avisa antes de qualquer mudanca relevante.
          </p>
          <ul class="diagnosis__advisor-list">
            <li>
              <UIcon name="i-lucide-check" class="size-4 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              <span>Analise da sua carteira atualizada em tempo real</span>
            </li>
            <li>
              <UIcon name="i-lucide-check" class="size-4 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              <span>Plano por objetivo (aposentadoria, casa, filhos, projeto)</span>
            </li>
            <li>
              <UIcon name="i-lucide-check" class="size-4 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              <span>Alertas no momento em que algo muda nos seus ativos</span>
            </li>
            <li>
              <UIcon name="i-lucide-check" class="size-4 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              <span>Conversa ilimitada com a IA avancada da Redent.IA</span>
            </li>
          </ul>
          <div class="flex flex-wrap gap-3">
            <NuxtLink to="/auth/register?plan=advisor" class="quiet-btn-primary">
              <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
              Ativar Assessor Inteligente
            </NuxtLink>
            <NuxtLink to="/help?q=Como+funciona+o+Assessor+Inteligente" class="quiet-btn-ghost">
              Como funciona
            </NuxtLink>
          </div>
        </div>
        <aside class="md:col-span-5">
          <article class="diagnosis__advisor-card">
            <header class="mb-4 flex items-center gap-3">
              <span class="diagnosis__advisor-avatar">
                <UIcon name="i-lucide-sparkles" class="size-5" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              </span>
              <div>
                <p class="text-[13px] font-medium" :style="{ color: 'var(--text-heading)' }">Assessor Inteligente</p>
                <p class="text-[11px] uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">IA AVANCADA · REDENT.IA</p>
              </div>
            </header>
            <ul class="diagnosis__advisor-bullets">
              <li>
                <span class="text-[11px] uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">PRIMEIRA ANALISE</span>
                <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">Gratis</span>
              </li>
              <li>
                <span class="text-[11px] uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">ACOMPANHAMENTO</span>
                <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">Diario, em tempo real</span>
              </li>
              <li>
                <span class="text-[11px] uppercase tracking-[0.12em]" :style="{ color: 'var(--text-muted)' }">RESPOSTA EM</span>
                <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">Segundos</span>
              </li>
            </ul>
            <p class="mt-4 text-[11px] leading-relaxed" :style="{ color: 'var(--text-muted)' }">
              IA proprietaria da Redent.IA com fundamentos, noticias e dados de mercado em tempo real. A plataforma oferece ferramentas de analise e educacao financeira; nao executa ordens nem fornece recomendacao individual de investimento.
            </p>
          </article>
        </aside>
      </div>
    </section>

    <!-- Disclaimer -->
    <footer class="diagnosis__disclaimer">
      A Redent.IA oferece ferramentas de analise, organizacao e educacao financeira. As informacoes nao constituem recomendacao individual de investimento. Consulte um profissional autorizado antes de tomar decisoes financeiras. Os dados sao apresentados para fins informativos e podem nao refletir as condicoes mais recentes do mercado.
    </footer>
  </div>
</template>

<style scoped>
.diagnosis__asset-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px 4px 10px;
  border-radius: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 500;
}

.diagnosis__asset-ticker {
  color: var(--text-heading);
  letter-spacing: 0.02em;
}

.diagnosis__asset-weight {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--text-body);
  font-size: 11px;
  font-weight: 500;
}

/* ============ Donut + metrics ============ */
.diagnosis__donut-wrap {
  position: relative;
  display: inline-flex;
  align-self: center;
  align-items: center;
  justify-content: center;
}

.diagnosis__donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: none;
}

.diagnosis__donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--brand-font);
}

.diagnosis__donut-legend li {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.diagnosis__donut-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.diagnosis__donut-label { color: var(--text-body); }
.diagnosis__donut-weight { color: var(--text-heading); font-weight: 500; }

.diagnosis__metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px 20px;
}

.diagnosis__metric-grid li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diagnosis__metric-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-weight: 500;
}

.diagnosis__metric-value {
  font-size: 22px;
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.01em;
}

.diagnosis__metric-hint { font-size: 12px; }

/* ============ Insights ============ */
.diagnosis__insight {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
}

.diagnosis__insight-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}

/* ============ Dimensoes / Setor ============ */
.diagnosis__dim, .diagnosis__sector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.diagnosis__dim-meta {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
}

.diagnosis__dim-bar,
.diagnosis__sector-bar {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-heading) 5%, transparent);
  overflow: hidden;
}

[data-mode='dark'] .diagnosis__dim-bar,
[data-mode='dark'] .diagnosis__sector-bar {
  background: color-mix(in srgb, var(--text-heading) 8%, transparent);
}

.diagnosis__dim-fill, .diagnosis__sector-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ============ Asset deep dive cards ============ */
.diagnosis__asset-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
  transition: border-color 200ms;
}

.diagnosis__asset-card:hover {
  border-color: var(--border-default);
}

.diagnosis__asset-thesis {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.diagnosis__asset-name {
  font-size: 13px;
  color: var(--text-body);
  margin-top: -4px;
}

.diagnosis__asset-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
  font-size: 12px;
  padding-top: 4px;
}

.diagnosis__asset-metrics li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  padding: 3px 0;
  border-bottom: 1px dashed color-mix(in srgb, var(--border-subtle) 70%, transparent);
}

.diagnosis__asset-metrics span { color: var(--text-muted); }
.diagnosis__asset-metrics strong { color: var(--text-heading); font-weight: 500; }

.diagnosis__asset-note {
  font-size: 12px;
  line-height: 1.5;
  margin-top: 6px;
}

/* ============ Strengths / risks / theses ============ */
.diagnosis__strength {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
}

.diagnosis__strength-icon, .diagnosis__risk-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.diagnosis__risk { padding: 18px 20px; }

.diagnosis__risk[data-severity='high'] {
  border-color: color-mix(in srgb, var(--brand-negative) 28%, transparent);
}

.diagnosis__risk[data-severity='medium'] {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

.diagnosis__risk-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.diagnosis__thesis {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}

.diagnosis__thesis-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

/* ============ Benchmarks ============ */
.diagnosis__benchmarks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diagnosis__benchmark {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
}

.diagnosis__benchmark-bar {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
  overflow: hidden;
}

.diagnosis__benchmark-bench {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: color-mix(in srgb, var(--text-muted) 30%, transparent);
  border-radius: 999px;
}

.diagnosis__benchmark-yours {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  mix-blend-mode: normal;
  opacity: 0.95;
}

/* ============ Stress test ============ */
.diagnosis__stress {
  padding: 18px 20px;
}

.diagnosis__stress-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.diagnosis__stress-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.diagnosis__stress-impact {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}

.diagnosis__stress-value {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1;
}

/* ============ Dividend forecast ============ */
.diagnosis__div-total {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
}

.diagnosis__div-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-elevated);
  overflow: hidden;
}

.diagnosis__div-list li {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.diagnosis__div-list li:last-child { border-bottom: 0; }

/* ============ Macro ============ */
.diagnosis__macro {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
}

.diagnosis__macro-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ============ Alternativas ============ */
.diagnosis__alt {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.diagnosis__alt-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
}

.diagnosis__alt-ticker {
  font-family: var(--brand-font);
  letter-spacing: 0.02em;
}

.diagnosis__alt-reason {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-body);
}

.diagnosis__alt-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
}

.diagnosis__alt-table li {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.diagnosis__alt-label {
  color: var(--text-muted);
  font-size: 12px;
}

/* ============ Eventos ============ */
.diagnosis__event {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-elevated);
  transition: border-color 200ms;
}

.diagnosis__event:hover { border-color: var(--border-default); }

.diagnosis__event-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.diagnosis__event-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.diagnosis__event-meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

/* ============ Perguntas sugeridas ============ */
.diagnosis__question {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-elevated);
  font-size: 13px;
  color: var(--text-heading);
  transition: border-color 200ms, background 200ms, transform 150ms;
  width: 100%;
}

.diagnosis__question:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated));
  transform: translateY(-1px);
}

/* ============ CTAs ============ */
.diagnosis__cta {
  position: relative;
  padding: 56px 32px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  isolation: isolate;
}

.diagnosis__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in srgb, var(--brand-primary) 28%, transparent), transparent 65%);
  pointer-events: none;
  z-index: -1;
}

.diagnosis__cta-inner { max-width: 720px; }

.diagnosis__advisor-cta {
  position: relative;
  padding: 56px 32px;
  border-radius: 16px;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated)) 0%,
    var(--bg-elevated) 100%);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, var(--border-subtle));
  overflow: hidden;
  isolation: isolate;
}

.diagnosis__advisor-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 70% at 0% 100%, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 65%);
  pointer-events: none;
  z-index: -1;
}

.diagnosis__advisor-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-body);
}

.diagnosis__advisor-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.diagnosis__advisor-card {
  padding: 24px;
  border-radius: 12px;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-card);
}

.diagnosis__advisor-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
}

.diagnosis__advisor-bullets {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 14px;
}

.diagnosis__advisor-bullets li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.diagnosis__disclaimer {
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-muted);
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  letter-spacing: 0.005em;
}
</style>
